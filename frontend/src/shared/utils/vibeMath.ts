// ═══════════════════════════════════════════════════════════════════════════
// vibeMath.ts — Bayesian Beta-Bernoulli Habit Probability Model
// ═══════════════════════════════════════════════════════════════════════════
//
// TEORI DASAR
// ──────────────────────────────────────────────────────────────────────────
// Setiap quest dimodelkan sebagai variabel acak θ ∈ (0, 1):
//
//   θ ~ Beta(α, β)
//
// θ merepresentasikan probabilitas bahwa user AKAN menyelesaikan quest ini.
//
// PARAMETER
// ──────────────────────────────────────────────────────────────────────────
//   α  = 1.0 + repetition_count
//        (prior 1.0 = "prior Laplace informatif standar" + jumlah penyelesaian berhasil)
//
//   β  = D + t × decayRate
//        Prior D = "resistansi awal" berdasarkan kesulitan.
//        t = hari sejak log terakhir.
//        decayRate = D / √(n+1) — habit yang lebih kuat lebih tahan decay.
//
// PROBABILITAS (Posterior Mean)
// ──────────────────────────────────────────────────────────────────────────
//   E[θ] = P = α / (α + β)
//
// PROPERTI MATEMATIS
// ──────────────────────────────────────────────────────────────────────────
//   P ∈ (0, 1)          — tidak pernah tepat 0 atau 1 (aksioma probabilitas)
//   P(t=0) = (n+1)/(n+1+D)  — nilai maksimum saat baru diselesaikan
//   P → 0 saat t → ∞   — mendekati 0 tapi tidak pernah mencapai 0
//   ∂P/∂n > 0           — setiap log meningkatkan probabilitas
//   ∂P/∂D < 0           — kesulitan lebih tinggi → probabilitas lebih rendah
//   Semua orang mulai dari prior yang sama → prinsip "peluang yang sama"
//
// REFERENSI
// ──────────────────────────────────────────────────────────────────────────
//   - Bayes, T. (1763). An Essay towards solving a Problem in the Doctrine
//     of Chances. Phil. Trans. Royal Society.
//   - Beta-Bernoulli Conjugacy: Gelman et al., Bayesian Data Analysis (2013)
//   - Ebbinghaus, H. (1885). Über das Gedächtnis. [Forgetting Curve]
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse a timestamp safely across all browsers (including Safari).
 * SQLite defaults to 'YYYY-MM-DD HH:MM:SS' which causes Safari to return NaN.
 * Normalizes space separators to 'T'.
 * If the string has no timezone designator (Z or +/-offset), appends 'Z' to parse as UTC.
 */
export function safeParseDate(timestamp: string | Date | number): Date {
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'number') return new Date(timestamp);
  if (!timestamp) return new Date();

  let cleanStr = String(timestamp).trim().replace(' ', 'T');
  if (cleanStr.includes('T') && !cleanStr.includes('Z') && !cleanStr.match(/[+-]\d{2}(:?\d{2})?$/)) {
    cleanStr += 'Z';
  }

  const parsed = new Date(cleanStr);
  if (isNaN(parsed.getTime())) {
    // Secondary fallback
    const fallback = new Date(String(timestamp).replace(/-/g, '/'));
    if (!isNaN(fallback.getTime())) return fallback;
  }
  return parsed;
}

/**
 * Menghitung jumlah hari sejak log terakhir.
 * Jika belum ada log, menghitung hari sejak quest dibuat (createdAt) agar ada decay asimtotik awal.
 * Mengembalikan 0 jika tidak ada log dan tidak ada tanggal dibuat.
 */
export function getDaysSinceLastLog(
  logs: { timestamp: string }[],
  createdAt?: string,
  sandboxDateOffset: number = 0
): number {
  const nowMs = Date.now() + sandboxDateOffset * 24 * 60 * 60 * 1000;

  if (!logs || logs.length === 0) {
    if (createdAt) {
      return Math.max(0, (nowMs - safeParseDate(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  const latestMs = logs.reduce((max, log) => {
    const t = safeParseDate(log.timestamp).getTime();
    return t > max ? t : max;
  }, 0);

  return Math.max(0, (nowMs - latestMs) / (1000 * 60 * 60 * 24));
}

/**
 * Menghitung parameter distribusi Beta (α, β) untuk sebuah quest.
 *
 * α = 1.0 + n         [prior informatif standar + jumlah penyelesaian]
 * β = D + t × (D/√(n+1))   [resistansi awal + penalti inaktivitas]
 *
 * Laju decay D/√(n+1) memastikan:
 *   n=0  → decayRate = D      (habit baru, rapuh)
 *   n=9  → decayRate ≈ 0.32D  (habit berkembang, lebih tahan)
 *   n=99 → decayRate = 0.1D   (habit kuat, sangat tahan decay)
 *
 * @param repetitionCount  Jumlah penyelesaian berhasil (n)
 * @param difficulty       Kesulitan quest (D), rentang 1–10
 * @param daysSinceLastLog Hari sejak log terakhir (t), 0 jika belum pernah
 */
export function getBetaParams(
  repetitionCount: number,
  difficulty: number,
  daysSinceLastLog: number
): { alpha: number; beta: number } {
  const alpha0 = 1.0;
  const alpha = alpha0 + repetitionCount;

  // Guard: difficulty must be > 0. A difficulty of exactly 0 would produce
  // beta0 = 0, decayRate = 0, and ultimately beta = 0, causing P = alpha / alpha = 1.0
  // (100% forever) — mathematically nonsensical. Clamp to 0.1 minimum.
  const safeDifficulty = Math.max(0.1, difficulty);

  // Prior β₀ = D: habit sulit membutuhkan lebih banyak bukti untuk terbentuk
  const beta0 = safeDifficulty;

  // Laju decay mengecil seiring habit menguat (redaman √)
  const decayRate = safeDifficulty / Math.sqrt(repetitionCount + 1);
  const inactivityPenalty = Math.max(0, daysSinceLastLog) * decayRate;

  return { alpha, beta: beta0 + inactivityPenalty };
}

/**
 * Posterior mean distribusi Beta: E[θ] = α / (α + β)
 *
 * Ini adalah estimasi terbaik probabilitas kebiasaan (habit probability).
 * P ∈ (0, 1) — tidak pernah tepat 0 atau 1.
 */
export function calculateBayesianProbability(alpha: number, beta: number): number {
  return alpha / (alpha + beta);
}

/**
 * Posterior variance distribusi Beta: Var[θ] = αβ / ((α+β)²(α+β+1))
 *
 * Mengukur ketidakpastian estimasi probabilitas.
 * Semakin kecil varians → semakin yakin kita dengan nilai P.
 * Semakin banyak log → varians mengecil (confidence meningkat).
 *
 * Standar deviasi: σ = √Var[θ]
 */
export function calculateBetaVariance(alpha: number, beta: number): number {
  const s = alpha + beta;
  return (alpha * beta) / (s * s * (s + 1));
}

// ─── Statistika Deskriptif untuk Analitik ──────────────────────────────────

/**
 * Menghitung mean (μ) dan standar deviasi (σ) dari interval antar-log.
 * Digunakan oleh analyticsService untuk deteksi burnout.
 *
 * Interval diukur dalam hari antar penyelesaian berturutan.
 * Menggunakan koreksi Bessel (divisor N-1) untuk memberikan estimasi varians sampel tak bias.
 */
export function calculateStats(logs: { timestamp: string }[]) {
  if (logs.length < 2) return { mu: 0, sigma: 0 };

  const dates = logs
    .map(l => safeParseDate(l.timestamp).getTime())
    .sort((a, b) => a - b);

  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
  }

  const mu = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const divisor = intervals.length > 1 ? intervals.length - 1 : 1;
  const variance =
    intervals.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / divisor;
  const sigma = Math.sqrt(variance);

  return { mu, sigma };
}

/**
 * Menghasilkan data time-series probabilitas (Bayesian) dari waktu ke waktu.
 * Digunakan oleh komponen grafik untuk memplot P(t) dan ketidakpastian.
 */
export function generateTimeSeriesData(
  logs: { timestamp: string }[],
  difficulty: number,
  startDateStr?: string,
  endDateStr?: string
) {
  // 1. Tentukan rentang waktu
  const end = endDateStr ? safeParseDate(endDateStr) : new Date();
  end.setHours(23, 59, 59, 999);

  // Jika tidak ada startDate, default ke 30 hari lalu, atau dari log pertama
  let start = new Date();
  start.setDate(end.getDate() - 30);
  start.setHours(0, 0, 0, 0);

  if (startDateStr) {
    start = safeParseDate(startDateStr);
    start.setHours(0, 0, 0, 0);
  } else if (logs.length > 0) {
    const firstLogDate = new Date(
      Math.min(...logs.map(l => safeParseDate(l.timestamp).getTime()))
    );
    firstLogDate.setHours(0, 0, 0, 0);
    // Jika log pertama lebih tua dari 30 hari, kita pakai log pertama sebagai start
    if (firstLogDate < start) {
      start = firstLogDate;
    }
  }

  // Sort log berdasarkan waktu
  const sortedLogs = [...logs].sort(
    (a, b) => safeParseDate(a.timestamp).getTime() - safeParseDate(b.timestamp).getTime()
  );

  const data = [];
  let currentDate = new Date(start);

  // Simulasi dari hari ke hari
  while (currentDate <= end) {
    const currentMs = currentDate.getTime();

    // 2. Filter log yang terjadi HINGGA (dan termasuk) currentDate
    const pastLogs = sortedLogs.filter(
      l => safeParseDate(l.timestamp).getTime() <= currentMs
    );

    const repetitionCount = pastLogs.length;

    // 3. Hitung decay (hari sejak log terakhir yang valid di masa lalu)
    let daysSinceLast = 0;
    if (repetitionCount > 0) {
      const lastLogMs = safeParseDate(pastLogs[pastLogs.length - 1].timestamp).getTime();
      daysSinceLast = (currentMs - lastLogMs) / (1000 * 60 * 60 * 24);
    } else if (startDateStr) {
      const createdMs = safeParseDate(startDateStr).getTime();
      if (!isNaN(createdMs)) {
        daysSinceLast = Math.max(0, (currentMs - createdMs) / (1000 * 60 * 60 * 24));
      }
    }

    // 4. Hitung model
    const { alpha, beta } = getBetaParams(repetitionCount, difficulty, daysSinceLast);
    const p = calculateBayesianProbability(alpha, beta);
    const variance = calculateBetaVariance(alpha, beta);
    const sigma = Math.sqrt(variance);

    data.push({
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
      prob: Math.round(p * 100),
      // Confidence band [P - σ, P + σ]
      lower: Math.max(0, Math.round((p - sigma) * 100)),
      upper: Math.min(100, Math.round((p + sigma) * 100)),
      alpha: Math.round(alpha),
      beta: Math.round(beta * 10) / 10,
      reps: repetitionCount,
    });

    // Maju 1 hari
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

/**
 * Menghasilkan data time-series distribusi peluang global (Single Global Beta Model dengan Jendela Rolling 30 Hari).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * KONSEP: ROLLING WINDOW SINGLE GLOBAL BETA MODEL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Untuk mencegah "Inactivity Lock-in" (di mana pengguna jangka panjang tetap memiliki
 * probabilitas global >95% meskipun telah absen selama sebulan penuh karena besarnya nilai α kumulatif),
 * model ini menggunakan **Jendela Bergulir 30 Hari** (30-day Rolling Window):
 *
 *   n_30(t) = total log aktif di seluruh quest dalam rentang [t - 30 hari, t]
 *   D_eff(t) = rata-rata difficulty tertimbang dari log aktif dalam jendela rolling
 *   t_idle(t) = hari sejak log global terakhir (tidak dibatasi jendela rolling)
 *
 *   α_global = 1.0 + n_30(t)   [Laplace smoothing + log dalam 30 hari terakhir]
 *   β_global = D_eff + t_idle × (D_eff / √(n_30 + 1))
 *   P_global = α_global / (α_global + β_global)
 *
 * PERILAKU YANG DIHARAPKAN
 * ──────────────────────────────────────────────────────────────────────────
 *   ✓ Quest selesai → n_30 naik → α naik → P naik (LANGSUNG)
 *   ✓ User absen → t_idle naik & n_30 meluruh → β naik & α menyusut → P turun secara dinamis
 *   ✓ Absen 30 hari penuh → n_30 kembali ke 0 → P kembali ke basis prior rendah secara elegan
 *   ✓ Menambah quest baru tidak menurunkan chart (tidak ada dilusi)
 */
export function generateGlobalTimeSeriesData(
  goals: { logs: { timestamp: string }[]; difficulty: number; createdAt?: string }[],
  startDateStr?: string,
  endDateStr?: string,
  windowDays: number = 30
) {
  const end = endDateStr ? safeParseDate(endDateStr) : new Date();
  end.setHours(23, 59, 59, 999);

  let start = new Date();
  start.setDate(end.getDate() - 30);
  start.setHours(0, 0, 0, 0);

  if (startDateStr) {
    start = safeParseDate(startDateStr);
    start.setHours(0, 0, 0, 0);
  }

  // ── Step 1: Kumpulkan semua log dari seluruh quest, urutkan berdasarkan waktu ─
  interface GlobalLogEvent {
    timestampMs: number;
    difficulty: number;
  }
  const allLogEvents: GlobalLogEvent[] = [];

  for (const goal of goals) {
    for (const log of goal.logs || []) {
      const ms = safeParseDate(log.timestamp).getTime();
      if (!isNaN(ms)) {
        allLogEvents.push({ timestampMs: ms, difficulty: goal.difficulty });
      }
    }
  }

  allLogEvents.sort((a, b) => a.timestampMs - b.timestampMs);

  // ── Step 2: Hitung D_eff baseline (rata-rata difficulty semua quest) ───────
  const difficultyBaseline =
    goals.length > 0
      ? goals.reduce((sum, g) => sum + g.difficulty, 0) / goals.length
      : 5;

  // ── Step 3: Iterasi harian — bangun Single Global Beta Model per hari ──────
  const data = [];
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const endOfDayMs = new Date(currentDate);
    endOfDayMs.setHours(23, 59, 59, 999);
    const endOfDayTimestamp = endOfDayMs.getTime();

    // Rolling Window: log aktif dalam [current_day - windowDays, current_day]
    const windowMs = windowDays * 24 * 60 * 60 * 1000;
    const windowStartMs = endOfDayTimestamp - windowMs;
    
    const activeLogs = allLogEvents.filter(
      e => e.timestampMs <= endOfDayTimestamp && e.timestampMs >= windowStartMs
    );

    // n: total log aktif kumulatif dalam window 30 hari
    const n = activeLogs.length;

    // D_eff: rata-rata difficulty tertimbang dari log aktif dalam window
    const diffWeightedSum = activeLogs.reduce((sum, e) => sum + e.difficulty, 0);
    const D_eff = n > 0 ? diffWeightedSum / n : difficultyBaseline;

    // t_idle: hari sejak log global terakhir secara absolut (tidak terbatas rolling window)
    const pastLogs = allLogEvents.filter(e => e.timestampMs <= endOfDayTimestamp);
    let t_idle = 0;
    if (pastLogs.length > 0) {
      const lastLogMs = pastLogs[pastLogs.length - 1].timestampMs;
      t_idle = Math.max(0, (endOfDayTimestamp - lastLogMs) / (1000 * 60 * 60 * 24));
    } else {
      // SEV-04 FIX: Jika belum ada log sama sekali, t_idle dihitung sejak pembuatan quest paling awal
      const allCreatedTimes = goals
        .map(g => g.createdAt ? safeParseDate(g.createdAt).getTime() : NaN)
        .filter(t => !isNaN(t));
      if (allCreatedTimes.length > 0) {
        const earliestCreatedMs = Math.min(...allCreatedTimes);
        t_idle = Math.max(0, (endOfDayTimestamp - earliestCreatedMs) / (1000 * 60 * 60 * 24));
      }
    }

    // ── Formula Beta Global (Jendela Bergulir dengan prior Laplace standar) ──
    const alpha = 1.0 + n;
    const decayRate = D_eff / Math.sqrt(n + 1);
    const beta = D_eff + t_idle * decayRate;
    const p = alpha / (alpha + beta);

    // Hitung variance untuk confidence band
    const s = alpha + beta;
    const variance = (alpha * beta) / (s * s * (s + 1));
    const sigma = Math.sqrt(variance);

    data.push({
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
      prob: Math.round(p * 100),
      lower: Math.max(0, Math.round((p - sigma) * 100)),
      upper: Math.min(100, Math.round((p + sigma) * 100)),
      reps: n, // total log aktif di window
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

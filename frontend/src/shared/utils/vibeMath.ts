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
//   α  = 0.1 + repetition_count
//        (prior 0.1 = "prior informatif rendah / sparse prior" + jumlah penyelesaian berhasil)
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
 * Menghitung jumlah hari sejak log terakhir.
 * Jika belum ada log, menghitung hari sejak quest dibuat (createdAt) agar ada decay asimtotik awal.
 * Mengembalikan 0 jika tidak ada log dan tidak ada tanggal dibuat.
 */
export function getDaysSinceLastLog(logs: { timestamp: string }[], createdAt?: string): number {
  if (!logs || logs.length === 0) {
    if (createdAt) {
      return Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  const latestMs = logs.reduce((max, log) => {
    const t = new Date(log.timestamp).getTime();
    return t > max ? t : max;
  }, 0);

  return Math.max(0, (Date.now() - latestMs) / (1000 * 60 * 60 * 24));
}

/**
 * Menghitung parameter distribusi Beta (α, β) untuk sebuah quest.
 *
 * α = 0.1 + n         [prior informatif rendah + jumlah penyelesaian]
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
  const alpha0 = 0.1;
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
 * σ tinggi → pola tidak konsisten → potensi burnout.
 */
export function calculateStats(logs: { timestamp: string }[]) {
  if (logs.length < 2) return { mu: 0, sigma: 0 };

  const dates = logs
    .map(l => new Date(l.timestamp).getTime())
    .sort((a, b) => a - b);

  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
  }

  const mu = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance =
    intervals.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / intervals.length;
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
  const end = endDateStr ? new Date(endDateStr) : new Date();
  end.setHours(23, 59, 59, 999);

  // Jika tidak ada startDate, default ke 30 hari lalu, atau dari log pertama
  let start = new Date();
  start.setDate(end.getDate() - 30);
  start.setHours(0, 0, 0, 0);

  if (startDateStr) {
    start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
  } else if (logs.length > 0) {
    const firstLogDate = new Date(
      Math.min(...logs.map(l => new Date(l.timestamp).getTime()))
    );
    firstLogDate.setHours(0, 0, 0, 0);
    // Jika log pertama lebih tua dari 30 hari, kita pakai log pertama sebagai start
    if (firstLogDate < start) {
      start = firstLogDate;
    }
  }

  // Sort log berdasarkan waktu
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const data = [];
  let currentDate = new Date(start);

  // Simulasi dari hari ke hari
  while (currentDate <= end) {
    const currentMs = currentDate.getTime();

    // 2. Filter log yang terjadi HINGGA (dan termasuk) currentDate
    const pastLogs = sortedLogs.filter(
      l => new Date(l.timestamp).getTime() <= currentMs
    );

    const repetitionCount = pastLogs.length;

    // 3. Hitung decay (hari sejak log terakhir yang valid di masa lalu)
    let daysSinceLast = 0;
    if (repetitionCount > 0) {
      const lastLogMs = new Date(pastLogs[pastLogs.length - 1].timestamp.replace(' ', 'T')).getTime();
      daysSinceLast = (currentMs - lastLogMs) / (1000 * 60 * 60 * 24);
    } else if (startDateStr) {
      // No logs yet — decay from the quest creation date so that old
      // un-completed quests show accurate declining probability rather
      // than a flat prior line.
      const createdMs = new Date(startDateStr.replace(' ', 'T')).getTime();
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
 * Menghasilkan data time-series distribusi peluang global (Single Global Beta Model).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * KONSEP: SINGLE GLOBAL BETA MODEL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Alih-alih merata-rata N model Beta independen (yang menyebabkan dilusi
 * saat quest baru ditambahkan dan chart naik-turun tidak intuitif),
 * seluruh aktivitas user dimodelkan sebagai SATU distribusi Beta tunggal:
 *
 *   θ_global ~ Beta(α_global, β_global)
 *
 * FORMULA (identik dengan getBetaParams, diterapkan secara global)
 * ──────────────────────────────────────────────────────────────────────────
 *   n(t)        = total log di semua quest hingga hari t
 *   D_eff(t)    = rata-rata difficulty tertimbang (berdasarkan log yang ada)
 *   t_idle(t)   = hari sejak log MANAPUN terakhir secara global
 *
 *   α(t) = 0.1 + n(t)
 *   β(t) = D_eff + t_idle(t) × (D_eff / √(n(t) + 1))
 *   P(t) = α(t) / (α(t) + β(t))
 *
 * PERILAKU YANG DIHARAPKAN
 * ──────────────────────────────────────────────────────────────────────────
 *   ✓ Quest selesai → n naik → α naik → P naik (LANGSUNG)
 *   ✓ User absen → t_idle naik → β naik → P turun (PERLAHAN)
 *   ✓ Semakin banyak log → decay lebih lambat (√(n+1) di penyebut)
 *   ✓ Quest lebih sulit (D besar) → butuh lebih banyak log untuk stabilisasi
 *   ✓ Menambah quest baru tidak menurunkan chart (tidak ada dilusi)
 *
 * CATATAN: D_eff = rata-rata difficulty dari semua quest yang punya log.
 * Jika belum ada log sama sekali, D_eff = rata-rata difficulty semua quest.
 */
export function generateGlobalTimeSeriesData(
  goals: { logs: { timestamp: string }[]; difficulty: number; createdAt?: string }[],
  startDateStr?: string,
  endDateStr?: string
) {
  const end = endDateStr ? new Date(endDateStr) : new Date();
  end.setHours(23, 59, 59, 999);

  let start = new Date();
  start.setDate(end.getDate() - 30);
  start.setHours(0, 0, 0, 0);

  if (startDateStr) {
    start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
  }

  // ── Step 1: Kumpulkan semua log dari seluruh quest, urutkan berdasarkan waktu ─
  // Setiap event menyimpan timestamp dan difficulty quest asalnya.
  interface GlobalLogEvent {
    timestampMs: number;
    difficulty: number;
  }
  const allLogEvents: GlobalLogEvent[] = [];

  for (const goal of goals) {
    for (const log of goal.logs || []) {
      const ms = new Date(log.timestamp).getTime();
      if (!isNaN(ms)) {
        allLogEvents.push({ timestampMs: ms, difficulty: goal.difficulty });
      }
    }
  }

  allLogEvents.sort((a, b) => a.timestampMs - b.timestampMs);

  // ── Step 2: Hitung D_eff baseline (rata-rata difficulty semua quest) ───────
  // Digunakan sebagai fallback sebelum ada log
  const difficultyBaseline =
    goals.length > 0
      ? goals.reduce((sum, g) => sum + g.difficulty, 0) / goals.length
      : 5;

  // ── Step 3: Iterasi harian — bangun Single Global Beta Model per hari ──────
  const data = [];
  let currentDate = new Date(start);
  let eventIndex = 0;     // pointer ke allLogEvents yang sudah ter-scan
  let totalLogs = 0;      // n(t): akumulasi total log hingga currentDate
  let diffWeightedSum = 0; // untuk menghitung D_eff(t): Σ difficulty dari log yang ada

  // Pre-scan: hitung log yang terjadi SEBELUM startDate (riwayat sebelum rentang)
  const startMs = start.getTime();
  while (eventIndex < allLogEvents.length && allLogEvents[eventIndex].timestampMs < startMs) {
    totalLogs++;
    diffWeightedSum += allLogEvents[eventIndex].difficulty;
    eventIndex++;
  }

  while (currentDate <= end) {
    const endOfDayMs = new Date(currentDate);
    endOfDayMs.setHours(23, 59, 59, 999);
    const endOfDayTimestamp = endOfDayMs.getTime();

    // Tambahkan semua log yang jatuh di hari ini
    while (eventIndex < allLogEvents.length && allLogEvents[eventIndex].timestampMs <= endOfDayTimestamp) {
      totalLogs++;
      diffWeightedSum += allLogEvents[eventIndex].difficulty;
      eventIndex++;
    }

    // n(t): total penyelesaian global hingga hari ini
    const n = totalLogs;

    // D_eff(t): rata-rata difficulty tertimbang dari log yang ada
    // Jika belum ada log, gunakan baseline (rata-rata difficulty semua quest)
    const D_eff = n > 0 ? diffWeightedSum / n : difficultyBaseline;

    // t_idle(t): hari sejak log terakhir secara global (di semua quest)
    let t_idle = 0;
    if (n > 0) {
      // Log terakhir = event tepat sebelum eventIndex (setelah scan hari ini)
      const lastLogMs = allLogEvents[eventIndex - 1]?.timestampMs ?? 0;
      t_idle = Math.max(0, (endOfDayTimestamp - lastLogMs) / (1000 * 60 * 60 * 24));
    }

    // ── Formula Beta Global (sama persis dengan getBetaParams) ──────────────
    //   α = 0.1 + n
    //   β = D_eff + t_idle × (D_eff / √(n + 1))
    //   P = α / (α + β)
    const alpha = 0.1 + n;
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
      reps: n, // total log kumulatif
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}


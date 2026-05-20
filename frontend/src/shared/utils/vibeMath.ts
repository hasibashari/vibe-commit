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
//   α  = 1 + repetition_count
//        (prior 1 = "satu kepercayaan awal" + jumlah penyelesaian berhasil)
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
 * Mengembalikan 0 jika belum ada log (quest baru — tidak ada decay).
 */
export function getDaysSinceLastLog(logs: { timestamp: string }[]): number {
  if (!logs || logs.length === 0) return 0;

  const latestMs = logs.reduce((max, log) => {
    const t = new Date(log.timestamp).getTime();
    return t > max ? t : max;
  }, 0);

  return Math.max(0, (Date.now() - latestMs) / (1000 * 60 * 60 * 24));
}

/**
 * Menghitung parameter distribusi Beta (α, β) untuk sebuah quest.
 *
 * α = 1 + n           [prior Jeffreys + jumlah penyelesaian]
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
  const alpha = 1 + repetitionCount;

  // Prior β₀ = D: habit sulit membutuhkan lebih banyak bukti untuk terbentuk
  const beta0 = difficulty;

  // Laju decay mengecil seiring habit menguat (redaman √)
  const decayRate = difficulty / Math.sqrt(repetitionCount + 1);
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

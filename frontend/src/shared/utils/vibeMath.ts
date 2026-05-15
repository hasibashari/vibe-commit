export function calculateProbability(repetition: number, difficulty: number, alpha: number): number {
  // P(t) = 1 - e^(-alpha * (R(t)/D))
  return 1 - Math.exp(-alpha * (repetition / difficulty));
}

/**
 * Bayesian adjustment for Difficulty (D)
 * Adjusts D based on mastery level to keep the user in the "Flow" state.
 * Prevents "Binary Failure Guilt" by lowering D if success is stagnant.
 */
export function adjustDifficultyBayesian(currentProb: number, currentD: number): number {
  const HIGH_THRESHOLD = 0.95; // Mastery imminent, increase challenge
  const LOW_THRESHOLD = 0.20;  // Stagnation risk, decrease friction
  
  if (currentProb > HIGH_THRESHOLD) {
    return currentD * 1.15; // Increase difficulty by 15%
  } else if (currentProb < LOW_THRESHOLD && currentProb > 0) {
    return currentD * 0.85; // Decrease difficulty by 15%
  }
  return currentD;
}

export function calculateStats(logs: { timestamp: string }[]) {
  if (logs.length < 2) return { mu: 0, sigma: 0 };

  const dates = logs.map(l => new Date(l.timestamp).getTime()).sort((a, b) => a - b);
  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24)); // Intervals in days
  }

  const mu = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / intervals.length;
  const sigma = Math.sqrt(variance);

  return { mu, sigma };
}

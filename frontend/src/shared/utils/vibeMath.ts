export function calculateProbability(repetition: number, difficulty: number, alpha: number): number {
  // Cap the repetition to act as a rolling window, otherwise P(t) quickly hits 1.0 forever
  const boundedRepetition = Math.min(repetition, 10);
  return 1 - Math.exp(-alpha * (boundedRepetition / difficulty));
}

/**
 * Bayesian adjustment for Difficulty (D)
 * Adjusts D based on mastery level to keep the user in the "Flow" state.
 * Prevents "Binary Failure Guilt" by lowering D if success is stagnant.
 */
export function adjustDifficultyBayesian(currentProb: number, currentD: number, repetition: number): number {
  const HIGH_THRESHOLD = 0.90; // Mastery imminent
  const LOW_THRESHOLD = 0.30;  // Stagnation risk
  const MIN_REPETITION = 5;
  
  let newDiff = currentD;
  if (currentProb > HIGH_THRESHOLD) {
    newDiff = currentD * 1.05; // 5% increase instead of 15% to slow down growth
  } else if (currentProb < LOW_THRESHOLD && repetition >= MIN_REPETITION) {
    newDiff = currentD * 0.95; // 5% decrease
  }
  
  // Bound the difficulty between 0.5 and 5.0 to prevent infinite scaling exploits
  return Math.max(0.5, Math.min(newDiff, 5.0));
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

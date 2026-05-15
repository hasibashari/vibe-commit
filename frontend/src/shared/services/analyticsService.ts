import { calculateStats } from "../utils/vibeMath";

/**
 * Stochastic Nudges: Smart reminders sent during focus peaks.
 * Uses historical log distribution to find the most likely "Vibe Windows".
 */
export function calculateStochasticNudges(logs: { timestamp: string }[]) {
  if (logs.length === 0) return null;

  // Track frequency of logs by hour of day
  const hourMap: Record<number, number> = {};
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    hourMap[hour] = (hourMap[hour] || 0) + 1;
  });

  // Find the peak hour
  const peakHour = Object.entries(hourMap).reduce((a, b) => 
    (b[1] > a[1] ? b : a), ["0", 0]
  );

  return {
    optimalHour: parseInt(peakHour[0]),
    confidence: peakHour[1] / logs.length,
    suggestion: `Focus peak detected at ${peakHour[0]}:00. Recommended trigger window.`
  };
}

export interface BurnoutPrediction {
  isBurnedOut: boolean;
  severity: "NONE" | "MODERATE" | "HIGH" | "CRITICAL";
  refactoringMessage?: string;
  sideQuests?: { title: string; description: string; type: string }[];
  adjustments?: string;
}

export function analyzeBurnoutRisk(logs: any[], goals: any[]): BurnoutPrediction {
  const now = new Date().getTime();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  
  const recentLogs = logs.filter(l => now - new Date(l.timestamp).getTime() < ONE_WEEK);
  const historicalLogs = logs.filter(l => now - new Date(l.timestamp).getTime() >= ONE_WEEK);

  let recentSigma = 0, historicalSigma = 0;
  let recentHighDiff = 0, historicalHighDiffAvg = 0;

  if (historicalLogs.length >= 3 && recentLogs.length >= 3) {
    recentSigma = calculateStats(recentLogs).sigma;
    historicalSigma = calculateStats(historicalLogs).sigma;

    const getHighDiffLogs = (logList: any[]) => logList.filter(l => {
      const goal = goals.find(g => g.id === l.goal_id);
      return goal && goal.difficulty >= 5;
    });

    recentHighDiff = getHighDiffLogs(recentLogs).length;
    historicalHighDiffAvg = getHighDiffLogs(historicalLogs).length / Math.max(1, historicalLogs.length / Math.max(1, recentLogs.length));
  } else if (logs.length > 5) {
    const overallStats = calculateStats(logs);
    if (overallStats.sigma > 2.0) {
      recentSigma = overallStats.sigma;
      historicalSigma = 1.0;
      recentHighDiff = 0;
      historicalHighDiffAvg = 5;
    }
  }

  const sigmaIncreased = recentSigma > historicalSigma * 1.5;
  const highDiffFell = recentHighDiff < historicalHighDiffAvg * 0.8;

  if ((sigmaIncreased && highDiffFell) || (recentSigma > 2.5)) {
    return {
      isBurnedOut: true,
      severity: recentSigma > 3 ? "CRITICAL" : "HIGH",
      refactoringMessage: "SYSTEM REFACTORING REQUIRED: Focus variance (σ) indicates structural fatigue. High-difficulty task execution is dropping.",
      sideQuests: [
        { title: "Defrag Sleep Cycle", description: "Enforce 8h offline mode. Disconnect from high-cognitive load logic gates.", type: "Rest" },
        { title: "Stochastic Nature Walk", description: "Wander without destination. Rebalance neural weights and reduce cortisol processes.", type: "Calming Nudge" }
      ],
      adjustments: "ADAPTIVE WORKLOAD: Cap max daily difficulty at 4.0 for the next 72 hours. Prioritize recovery pacing to maintain reliable 1% systemic growth."
    };
  }

  return { isBurnedOut: false, severity: "NONE" };
}

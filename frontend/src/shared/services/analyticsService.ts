import { calculateStats, safeParseDate } from "../utils/vibeMath";

/**
 * Stochastic Nudges: Smart reminders sent during focus peaks.
 * Uses historical log distribution to find the most likely "Vibe Windows".
 */
export function calculateStochasticNudges(logs: { timestamp: string }[]) {
  if (logs.length === 0) return null;

  // Track frequency of logs by hour of day
  const hourMap: Record<number, number> = {};
  logs.forEach(log => {
    const hour = safeParseDate(log.timestamp).getHours();
    hourMap[hour] = (hourMap[hour] || 0) + 1;
  });

  // Find the peak hour
  const peakHour = Object.entries(hourMap).reduce((a, b) => 
    (b[1] > a[1] ? b : a), ["0", 0]
  );

  return {
    optimalHour: parseInt(peakHour[0]),
    confidence: peakHour[1] / logs.length,
    suggestion: `Puncak fokus terdeteksi pada pukul ${peakHour[0]}:00. Waktu yang disarankan untuk beraktivitas.`
  };
}

export interface BurnoutPrediction {
  isBurnedOut: boolean;
  severity: "NONE" | "MODERATE" | "HIGH" | "CRITICAL";
  refactoringMessage?: string;
  sideQuests?: { title: string; description: string; type: string }[];
  adjustments?: string;
}

import type { Log } from '../types/log';
import type { Goal } from '../types/goal';

export function analyzeBurnoutRisk(logs: Log[], goals: Goal[], offset: number = 0): BurnoutPrediction {
  const nowTime = (() => {
    const now = new Date();
    if (offset !== 0) {
      now.setDate(now.getDate() + offset);
    }
    return now.getTime();
  })();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  
  const recentLogs = logs.filter(l => nowTime - safeParseDate(l.timestamp).getTime() < ONE_WEEK);
  const historicalLogs = logs.filter(l => nowTime - safeParseDate(l.timestamp).getTime() >= ONE_WEEK);

  let recentSigma = 0, historicalSigma = 0;
  let recentHighDiff = 0, historicalHighDiffAvg = 0;

  if (historicalLogs.length >= 3 && recentLogs.length >= 3) {
    recentSigma = calculateStats(recentLogs).sigma;
    historicalSigma = calculateStats(historicalLogs).sigma;

    const getHighDiffLogs = (logList: Log[]) => logList.filter(l => {
      const goal = goals.find(g => g.id === l.goal_id);
      return goal && goal.difficulty >= 5;
    });

    recentHighDiff = getHighDiffLogs(recentLogs).length;

    // Temukan timestamp log historis paling awal
    const histTimestamps = historicalLogs.map(l => safeParseDate(l.timestamp).getTime());
    const earliestHistMs = Math.min(...histTimestamps);

    // Hitung jumlah minggu historis riil (aman dari pembagian tidak valid, minimal 1 minggu)
    const histWeeks = Math.max(1, (nowTime - earliestHistMs) / (7 * 24 * 60 * 60 * 1000));

    // Dapatkan rata-rata murni log kesulitan tinggi per minggu historis
    historicalHighDiffAvg = getHighDiffLogs(historicalLogs).length / histWeeks;
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
      refactoringMessage: "PERLU REFACTORING SISTEM: Variansi fokus (σ) mengindikasikan kelelahan struktural. Eksekusi tugas dengan kesulitan tinggi mulai menurun.",
      sideQuests: [
        { title: "Defrag Siklus Tidur", description: "Terapkan mode offline 8 jam. Putuskan koneksi dari tugas dengan beban kognitif tinggi.", type: "Istirahat" },
        { title: "Jalan Alam Santai", description: "Jalan-jalan tanpa tujuan spesifik. Seimbangkan kembali bobot saraf dan kurangi proses kortisol.", type: "Penyesuaian Menenangkan" }
      ],
      adjustments: "BEBAN KERJA ADAPTIF: Batasi kesulitan harian maksimal di tingkat 4.0 selama 72 jam ke depan. Prioritaskan pemulihan untuk menjaga pertumbuhan sistemik 1% yang stabil."
    };
  }

  return { isBurnedOut: false, severity: "NONE" };
}

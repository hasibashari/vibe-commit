/**
 * dateUtils.ts — Centralised date helpers for vibe-commit
 *
 * KEY RULES:
 *  1. Never use `new Date('YYYY-MM-DD')` — that parses as UTC midnight,
 *     producing the wrong day for any UTC+ timezone (e.g. Indonesia UTC+7).
 *     Use `parseLocalDate` instead.
 *  2. Always derive "today" as a local date string, not a UTC string from
 *     toISOString(). Use `getTodayLocalString`.
 *  3. Use `parseLogTimestamp` to handle both SQLite-style spaces ('2026-01-01 10:00')
 *     and ISO 8601 ('2026-01-01T10:00') safely across all browsers (Safari).
 */

/**
 * Returns today's date as a YYYY-MM-DD string in the *local* timezone.
 * Replaces the scattered: new Date().toISOString().split('T')[0]  (which is UTC)
 */
export function getTodayLocalString(offset: number = 0): string {
  const now = new Date();
  if (offset !== 0) {
    now.setDate(now.getDate() + offset);
  }
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a YYYY-MM-DD date string as LOCAL midnight (not UTC midnight).
 * Fixes: new Date("2026-05-21") → wrong day in UTC+ timezones.
 */
export function parseLocalDate(dateStr: string): Date {
  // Append T00:00:00 to force local-time interpretation
  return new Date(`${dateStr}T00:00:00`);
}

/**
 * Parse a log timestamp that may be either:
 *   - ISO 8601:     "2026-01-15T10:30:00.000Z"
 *   - SQLite space: "2026-01-15 10:30:00"
 * Safari rejects the space format; normalise it first.
 * Appends 'Z' if no timezone offset is provided to ensure universal UTC parsing.
 */
export function parseLogTimestamp(timestamp: string): Date {
  if (!timestamp) return new Date(NaN);
  let cleanStr = timestamp.trim().replace(' ', 'T');
  if (cleanStr.includes('T') && !cleanStr.includes('Z') && !cleanStr.match(/[+-]\d{2}(:?\d{2})?$/)) {
    cleanStr += 'Z';
  }
  return new Date(cleanStr);
}

/**
 * Extract just the YYYY-MM-DD part from a log timestamp string.
 * Works with both space and 'T' separator formats.
 * Normalizes the date from UTC (database timezone) to the browser's local timezone
 * before formatting as YYYY-MM-DD to avoid timezone-boundary discrepancy.
 */
export function getLogDateString(timestamp: string): string {
  if (!timestamp) return '';
  
  let cleanStr = timestamp.trim().replace(' ', 'T');
  if (cleanStr.includes('T') && !cleanStr.includes('Z') && !cleanStr.match(/[+-]\d{2}(:?\d{2})?$/)) {
    cleanStr += 'Z';
  }

  const date = new Date(cleanStr);
  if (isNaN(date.getTime())) {
    // Fallback to naive splitting if parsing fails
    return timestamp.split('T')[0].split(' ')[0];
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the number of whole days between two Date objects.
 * Always uses Math.floor (not ceil) to avoid counting partial days.
 * Fixes the heatmap and penalty-day off-by-one bugs.
 */
export function getDaysBetween(earlier: Date, later: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((later.getTime() - earlier.getTime()) / msPerDay);
}

/**
 * Computes the cumulative EXP earned across all levels up to (but not
 * including) `level`, then adds the current `exp` within that level.
 *
 * Formula: Σ floor(100 * 1.2^(i-1)) for i in [1, level-1], plus current exp.
 *
 * Shared between App.tsx and dashboardUtils so there is a single source of truth.
 * Includes an overflow cap at MAX_LEVEL to prevent IEEE 754 precision loss.
 */
export const MAX_LEVEL = 100;

export function getExpNeededForLevel(level: number): number {
  const safeLvl = Math.min(level, MAX_LEVEL);
  return Math.floor(100 * Math.pow(1.2, safeLvl - 1));
}

export function getCumulativeExp(level: number, exp: number): number {
  const safeLevel = Math.min(level, MAX_LEVEL + 1);
  let sum = 0;
  for (let i = 1; i < safeLevel; i++) {
    sum += getExpNeededForLevel(i);
  }
  return sum + exp;
}

/**
 * Computes the spendable coin balance for a user.
 * Coins = total lifetime EXP earned − total coins already spent.
 */
export function getAvailableCoins(level: number, exp: number, spentCoins: number): number {
  return Math.max(0, getCumulativeExp(level, exp) - spentCoins);
}

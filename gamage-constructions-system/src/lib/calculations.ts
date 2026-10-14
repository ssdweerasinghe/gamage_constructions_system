// src/lib/calculations.ts

/**
 * Gamage Constructions Standard Rate Configuration:
 * 1 Point = 1 Hour (60 mins)
 * 0.1 Point = 6 mins
 * Base Charge = LKR 7,000.00 per 1.0 point
 */
export const RATE_PER_POINT = 7000.0;

export interface CalculationResult {
  totalMinutes: number;
  durationHours: number;
  points: number;
  totalCharge: number;
}

/**
 * Calculates billable points and total charge from start and end times ("HH:MM" format).
 * Handles standard daytime shifts as well as shifts extending past midnight.
 * 
 * Logic:
 * - 60 minutes = 1.0 point (0.1 point per 6-minute increment)
 * - Rounds to one decimal place to enforce the 0.1 pt / 6 min precision
 */
export function calculatePoints(startTimeStr: string, endTimeStr: string): CalculationResult {
  if (!startTimeStr || !endTimeStr) {
    return {
      totalMinutes: 0,
      durationHours: 0,
      points: 0,
      totalCharge: 0,
    };
  }

  const [startH, startM] = startTimeStr.split(":").map(Number);
  const [endH, endM] = endTimeStr.split(":").map(Number);

  const startTotalMinutes = startH * 60 + startM;
  let endTotalMinutes = endH * 60 + endM;

  // Handle shifts crossing midnight (e.g., 22:00 to 02:00)
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  const totalMinutes = endTotalMinutes - startTotalMinutes;
  const durationHours = parseFloat((totalMinutes / 60).toFixed(2));

  // 1 hr = 1.0 point, 6 min = 0.1 point
  // Round to 1 decimal place: (minutes / 60) * 10 / 10
  const points = Math.round((totalMinutes / 60) * 10) / 10;
  const totalCharge = Math.round(points * RATE_PER_POINT * 100) / 100;

  return {
    totalMinutes,
    durationHours,
    points,
    totalCharge,
  };
}

/**
 * Formats numeric values to Sri Lankan Rupee currency display (e.g., "LKR 31,500.00").
 */
export function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates net operational profit for a machine or the whole fleet.
 */
export function calculateNetProfit(totalIncome: number, totalExpenses: number): number {
  return totalIncome - totalExpenses;
}
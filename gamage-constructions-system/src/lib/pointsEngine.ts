// src/lib/pointsEngine.ts

export const BASE_RATE_PER_POINT = 7000.0; // LKR 7,000 per point[cite: 1]

export interface PointsCalculationResult {
  totalMinutes: number;
  durationHours: number;
  points: number;
  charge: number;
}

/**
 * Calculates billable points from start and end times in "HH:MM" 24-hr format.
 * - 1 Hour (60 mins) = 1.0 Point[cite: 1]
 * - 6 Minutes = 0.1 Point[cite: 1]
 * - Charge = Points * LKR 7,000.00[cite: 1]
 */
export function calculateJCBPoints(startTime: string, endTime: string): PointsCalculationResult {
  if (!startTime || !endTime) {
    return { totalMinutes: 0, durationHours: 0, points: 0, charge: 0 };
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  let totalMinutes = endTotalMinutes - startTotalMinutes;
  if (totalMinutes < 0) {
    totalMinutes = 0; // Negative handling
  }

  const durationHours = parseFloat((totalMinutes / 60).toFixed(2));

  // 1 point = 60 mins -> 0.1 point per 6 min chunk
  // (totalMinutes / 60) rounded to 1 decimal place satisfies 0.1 pt per 6 mins
  const points = Math.round((totalMinutes / 60) * 10) / 10;
  const charge = points * BASE_RATE_PER_POINT;

  return {
    totalMinutes,
    durationHours,
    points,
    charge,
  };
}

export function formatCurrencyLKR(val: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(val);
}
// src/lib/calculations.ts

/**
 * Gamage Constructions Standard Rate Configuration:
 * 1.0 Point = 1 Hour (60 mins)
 * 0.1 Point = 6 mins
 * Fixed Charge = LKR 7,000.00 per 1.0 point
 */
export const RATE_PER_POINT = 7000.0;

export interface PointsCalculationResult {
  points: number;
  totalCharge: number;
  equivalentHours: number;
  equivalentMinutes: number;
  durationLabel: string;
}

/**
 * Primary Engine: Computes total charge and work duration directly from billable points.
 */
export function calculateFromPoints(pointsInput: number | string): PointsCalculationResult {
  const points = Math.max(0, Math.round((Number(pointsInput) || 0) * 10) / 10);
  const totalCharge = Math.round(points * RATE_PER_POINT * 100) / 100;
  
  // 1 pt = 60 mins -> 0.1 pt = 6 mins
  const totalMinutes = Math.round(points * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const durationLabel = `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();

  return {
    points,
    totalCharge,
    equivalentHours: parseFloat((totalMinutes / 60).toFixed(2)),
    equivalentMinutes: totalMinutes,
    durationLabel: durationLabel || "0h",
  };
}

/**
 * Formats numeric values to Sri Lankan Rupee display (e.g., "LKR 35,000.00").
 */
export function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
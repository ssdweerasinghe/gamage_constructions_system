// src/types/index.ts

export type JcbStatus = "ACTIVE" | "MAINTENANCE" | "IDLE";
export type PaymentStatus = "PAID" | "PENDING" | "PARTIAL";
export type ExpenseCategory = "FUEL" | "MAINTENANCE" | "REPAIR" | "SALARY" | "OTHER";

export interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  activeJcbCount: number;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface ExpenseBreakdownData {
  name: string;
  value: number;
}
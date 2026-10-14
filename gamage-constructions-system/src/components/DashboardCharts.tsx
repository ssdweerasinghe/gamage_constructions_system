// src/components/DashboardCharts.tsx
"use client";

import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatLKR } from "@/lib/calculations";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

interface ExpenseCategoryData {
  name: string;
  value: number;
}

const PIE_COLORS: Record<string, string> = {
  FUEL: "#f59e0b",
  MAINTENANCE: "#3b82f6",
  REPAIR: "#ef4444",
  SALARY: "#10b981",
  OTHER: "#8b5cf6",
};

export default function DashboardCharts({
  monthlyData,
  expenseData,
}: {
  monthlyData: MonthlyData[];
  expenseData: ExpenseCategoryData[];
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#cbd5e1";
  const tooltipColor = isDark ? "#ffffff" : "#0f172a";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Bar Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Monthly Cash Flow & Profit Trends (2026)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Comparative analysis of Gross Inflow vs. Operating Expenses
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" stroke={axisColor} tick={{ fontSize: 12 }} />
              <YAxis
                stroke={axisColor}
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: "0.75rem",
                  color: tooltipColor,
                }}
                formatter={(value: any) => formatLKR(Number(value) || 0)}
              />
              <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown Pie Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Expense Outflow Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Breakdown across fuel, maintenance, and repairs
          </p>
        </div>

        <div className="h-72 w-full flex items-center justify-center">
          {expenseData.length === 0 ? (
            <p className="text-xs text-slate-500">No expenses recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={PIE_COLORS[entry.name] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "0.75rem",
                    color: tooltipColor,
                  }}
                  formatter={(value: any) => formatLKR(Number(value) || 0)}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
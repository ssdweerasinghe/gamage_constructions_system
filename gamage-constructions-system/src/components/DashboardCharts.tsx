// src/components/DashboardCharts.tsx
"use client";

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
  FUEL: "#f59e0b",         // Amber
  MAINTENANCE: "#3b82f6",  // Blue
  REPAIR: "#ef4444",       // Rose Red
  SALARY: "#10b981",       // Emerald Green
  OTHER: "#8b5cf6",        // Purple
};

export default function DashboardCharts({
  monthlyData,
  expenseData,
}: {
  monthlyData: MonthlyData[];
  expenseData: ExpenseCategoryData[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Bar Chart */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Monthly Cash Flow & Profit Trends (2026)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative analysis of Gross Inflow vs. Operating Expenses
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.75rem",
                  color: "#fff",
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Expense Outflow Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
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
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#fff",
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
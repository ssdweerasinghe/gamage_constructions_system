// src/app/dashboard/page.tsx
import { getDashboardData } from "@/app/actions/dashboard";
import DashboardCharts from "@/components/DashboardCharts";
import { formatLKR } from "@/lib/calculations";
import { connection } from "next/server";
import Link from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  PlusCircle,
  FileSpreadsheet,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default async function DashboardPage() {
  await connection();
  const { metrics, monthlyChartData, expensePieData, recentIncomes } =
    await getDashboardData();

  const isProfitable = metrics.netProfit >= 0;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Executive Overview
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            Gamage Constructions Financial Hub
          </h2>
          <p className="text-sm text-slate-400">
            Real-time JCB machinery revenues, operational outflows, and net profit margins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/dashboard/income"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-xs transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Record New Shift</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Income */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-white">{formatLKR(metrics.totalIncome)}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>{formatLKR(metrics.monthlyIncome)} this month</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-white">{formatLKR(metrics.totalExpenses)}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400 font-semibold">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>{formatLKR(metrics.monthlyExpenses)} this month</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Business Profit
            </span>
            <div
              className={`p-2 rounded-xl border ${
                isProfitable
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p
              className={`text-2xl font-black ${
                isProfitable ? "text-amber-400" : "text-rose-400"
              }`}
            >
              {formatLKR(metrics.netProfit)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
              <span>Monthly Margin:</span>
              <span
                className={`font-bold ${
                  metrics.monthlyProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatLKR(metrics.monthlyProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* Active JCB Fleet */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fleet Status
            </span>
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-white">
              {metrics.activeMachines}{" "}
              <span className="text-sm font-normal text-slate-500">
                / {metrics.totalMachines} Units
              </span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-400 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Machines active on construction sites</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <DashboardCharts
        monthlyData={monthlyChartData}
        expenseData={expensePieData}
      />

      {/* Recent Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white text-base">Recent Worksite Invoices</h3>
            <p className="text-xs text-slate-400">Latest calculated equipment shifts</p>
          </div>
          <a
            href="/dashboard/income"
            className="text-xs font-semibold text-amber-500 hover:text-amber-400"
          >
            View All &rarr;
          </a>
        </div>

        {recentIncomes.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No shift entries yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">JCB Plate</th>
                  <th className="px-5 py-3">Client / Site</th>
                  <th className="px-5 py-3 text-center">Points</th>
                  <th className="px-5 py-3 text-right">Total Charge</th>
                  <th className="px-5 py-3 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-xs">
                {recentIncomes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-mono text-amber-400 font-bold">
                      {item.jcb.plateNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-white font-semibold">{item.clientName}</div>
                      <div className="text-slate-400 text-[11px]">{item.siteLocation}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-amber-400">
                      {item.points.toFixed(1)} PTS
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-white">
                      {formatLKR(item.totalCharge)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.paymentStatus === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
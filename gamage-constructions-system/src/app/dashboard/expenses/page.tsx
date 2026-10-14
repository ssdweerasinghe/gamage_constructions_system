// src/app/dashboard/expenses/page.tsx
import { getExpenseLogs } from "@/app/actions/expense";
import { getJcbMachines } from "@/app/actions/jcb";
import AddExpenseForm from "@/components/AddExpenseForm";
import AdminDeleteButton from "@/components/AdminDeleteButton";
import { getCurrentUser } from "@/lib/auth";
import { formatLKR } from "@/lib/calculations";
import { connection } from "next/server";
import {
  Fuel,
  Wrench,
  Calendar,
  Gauge,
  TrendingDown,
  DollarSign,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

export default async function ExpensesPage() {
  await connection();
  const [expenses, jcbList, user] = await Promise.all([
    getExpenseLogs(),
    getJcbMachines(),
    getCurrentUser(),
  ]);

  const isAdmin = user?.role === "ADMIN";
  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFuelLiters = expenses
    .filter((e) => e.category === "FUEL" && e.liters)
    .reduce((acc, curr) => acc + (curr.liters || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Fleet Operating Expenses</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {expenses.length} Logged Entries
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Fuel consumption, routine maintenance, greasing, and spare parts.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3">
          <div>
            <span className="text-xs text-slate-500 block">Total Outflow</span>
            <span className="text-lg font-black text-rose-400">
              {formatLKR(totalExpenseAmount)}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-500 block">Total Diesel</span>
            <span className="text-lg font-bold text-amber-400">
              {totalFuelLiters.toFixed(1)} L
            </span>
          </div>
        </div>
      </div>

      {/* Operational Expense Input Form */}
      <AddExpenseForm
        jcbList={jcbList.map((j) => ({
          id: j.id,
          plateNumber: j.plateNumber,
          modelName: j.modelName,
        }))}
      />

      {/* Expense Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Expense Outflow Ledger</h3>
            <p className="text-xs text-slate-400">
              All registered machinery expenses by equipment and category
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <FileSpreadsheet className="h-4 w-4 text-rose-500" />
            <span>Outflow Ledger</span>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No expenses recorded yet. Use the form above to log fuel or repair bills.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Date / JCB</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Telemetry</th>
                  <th className="px-5 py-3.5 text-right">Amount (LKR)</th>
                  {isAdmin && <th className="px-5 py-3.5 text-center">Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {expenses.map((item) => {
                  const isFuel = item.category === "FUEL";
                  const isMaint = item.category === "MAINTENANCE";
                  const isRepair = item.category === "REPAIR";
                  const isSalary = item.category === "SALARY";

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Date / Plate */}
                      <td className="px-5 py-4">
                        <div className="font-mono text-white text-xs font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded inline-block mb-1 border border-amber-500/20">
                          {item.jcb.plateNumber}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.expenseDate).toLocaleDateString("en-GB")}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isFuel
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : isMaint
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : isRepair
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : isSalary
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {isFuel && <Fuel className="h-3 w-3" />}
                          {isMaint && <Wrench className="h-3 w-3" />}
                          {isRepair && <AlertTriangle className="h-3 w-3" />}
                          {isSalary && <UserCheck className="h-3 w-3" />}
                          {item.category}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 text-white max-w-xs">
                        <div className="font-semibold text-white">{item.description}</div>
                      </td>

                      {/* Telemetry (Liters / Hours) */}
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {item.liters && (
                          <div className="flex items-center gap-1 text-slate-300">
                            <Fuel className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>{item.liters} Liters</span>
                          </div>
                        )}
                        {item.meterReading && (
                          <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                            <Gauge className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>Meter: {item.meterReading} hrs</span>
                          </div>
                        )}
                        {!item.liters && !item.meterReading && <span>-</span>}
                      </td>

                      {/* Outflow Amount */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-black text-rose-400">
                          {formatLKR(item.amount)}
                        </span>
                      </td>

                      {/* Admin Delete Action */}
                      {isAdmin && (
                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center">
                            <AdminDeleteButton id={item.id} type="EXPENSE" />
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
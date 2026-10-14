// src/app/dashboard/income/page.tsx
import { getIncomeLogs } from "@/app/actions/income";
import { getJcbMachines } from "@/app/actions/jcb";
import AddIncomeForm from "@/components/AddIncomeForm";
import AdminDeleteButton from "@/components/AdminDeleteButton";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import { getCurrentUser } from "@/lib/auth";
import { formatLKR } from "@/lib/calculations";
import { connection } from "next/server";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Award,
} from "lucide-react";

export default async function IncomePage() {
  await connection();
  const [logs, jcbList, user] = await Promise.all([
    getIncomeLogs(),
    getJcbMachines(),
    getCurrentUser(),
  ]);

  const isAdmin = user?.role === "ADMIN";
  const totalRevenue = logs.reduce((acc, curr) => acc + curr.totalCharge, 0);
  const totalPoints = logs.reduce((acc, curr) => acc + curr.points, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>Operational Points & Incomes</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {logs.length} Logged Runs
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Machinery billing calculated directly by Points (1.0 pt = LKR 7,000.00).
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-sm dark:shadow-none">
          <div>
            <span className="text-xs text-slate-500 block">Total Shift Revenue</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatLKR(totalRevenue)}
            </span>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
            <span className="text-xs text-slate-500 block">Cumulative Points</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>{totalPoints.toFixed(1)} PTS</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Points Entry Form */}
      <AddIncomeForm
        jcbList={jcbList.map((j) => ({
          id: j.id,
          plateNumber: j.plateNumber,
          modelName: j.modelName,
          driverName: j.driverName,
        }))}
      />

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Recorded Points & Shift Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Point allocations, billable totals, and client work slips
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <FileSpreadsheet className="h-4 w-4 text-amber-500" />
            <span>Points Ledger</span>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No shift logs found. Enter points in the form above to record a shift.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Date / JCB</th>
                  <th className="px-5 py-3.5">Client & Site</th>
                  <th className="px-5 py-3.5 text-center">Billed Points</th>
                  <th className="px-5 py-3.5 text-center">Equivalent Time</th>
                  <th className="px-5 py-3.5 text-right">Total Charge (LKR)</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Slip</th>
                  {isAdmin && <th className="px-5 py-3.5 text-center">Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                {logs.map((log) => {
                  const invoicePayload = {
                    invoiceNumber: log.id.slice(-6).toUpperCase(),
                    clientName: log.clientName,
                    siteLocation: log.siteLocation,
                    date: new Date(log.logDate).toLocaleDateString("en-GB"),
                    jcbPlate: log.jcb.plateNumber,
                    jcbModel: log.jcb.modelName,
                    driverName: log.jcb.driverName,
                    startTime: log.startTime || "Shift",
                    endTime: log.endTime || "Standard",
                    durationHours: log.durationHours,
                    points: log.points,
                    ratePerPoint: log.ratePerPoint,
                    totalCharge: log.totalCharge,
                    paymentStatus: log.paymentStatus,
                    notes: log.notes,
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      {/* Date / Plate */}
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded inline-block mb-1 border border-amber-500/20">
                          {log.jcb.plateNumber}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.logDate).toLocaleDateString("en-GB")}
                        </div>
                      </td>

                      {/* Client / Location */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {log.clientName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{log.siteLocation}</span>
                        </div>
                        {log.notes && (
                          <div className="text-[11px] text-slate-500 italic mt-1 truncate max-w-xs">
                            {log.notes}
                          </div>
                        )}
                      </td>

                      {/* PRIMARY: Billed Points */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-block px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-black text-sm border border-amber-500/30">
                          {log.points.toFixed(1)} PTS
                        </span>
                      </td>

                      {/* Equivalent Duration */}
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {log.durationHours} hrs
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          ({Math.round(log.points * 60)} mins)
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-black text-slate-900 dark:text-white text-base">
                          {formatLKR(log.totalCharge)}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          @ {formatLKR(log.ratePerPoint)}/pt
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            log.paymentStatus === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {log.paymentStatus === "PAID" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {log.paymentStatus}
                        </span>
                      </td>

                      {/* PDF Work Slip */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center">
                          <DownloadInvoiceButton invoiceData={invoicePayload} />
                        </div>
                      </td>

                      {/* Admin Delete */}
                      {isAdmin && (
                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center">
                            <AdminDeleteButton id={log.id} type="INCOME" />
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
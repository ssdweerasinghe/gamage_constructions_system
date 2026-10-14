// src/app/dashboard/income/page.tsx
import { getIncomeLogs } from "@/app/actions/income";
import { getJcbMachines } from "@/app/actions/jcb";
import AddIncomeForm from "@/components/AddIncomeForm";
import { formatLKR } from "@/lib/calculations";
import { connection } from "next/server";
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

export default async function IncomePage() {
  await connection();
  const [logs, jcbList] = await Promise.all([getIncomeLogs(), getJcbMachines()]);

  const totalRevenue = logs.reduce((acc, curr) => acc + curr.totalCharge, 0);
  const totalPoints = logs.reduce((acc, curr) => acc + curr.points, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Operational Shift Income</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {logs.length} Recorded Shifts
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Points-based machine utilization logs and client billings.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3">
          <div>
            <span className="text-xs text-slate-500 block">Total Shift Revenue</span>
            <span className="text-lg font-black text-emerald-400">{formatLKR(totalRevenue)}</span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-500 block">Total Points</span>
            <span className="text-lg font-bold text-amber-400">{totalPoints.toFixed(1)} PTS</span>
          </div>
        </div>
      </div>

      {/* Operational Input Form */}
      <AddIncomeForm
        jcbList={jcbList.map((j) => ({
          id: j.id,
          plateNumber: j.plateNumber,
          modelName: j.modelName,
          driverName: j.driverName,
        }))}
      />

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800">
          <h3 className="font-bold text-white text-base">Recorded Shift Invoices</h3>
          <p className="text-xs text-slate-400">Detailed points breakdown per machine assignment</p>
        </div>

        {logs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No shift logs found. Fill out the operational form above to register an entry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Date / JCB</th>
                  <th className="px-5 py-3.5">Client & Location</th>
                  <th className="px-5 py-3.5">Shift Hours</th>
                  <th className="px-5 py-3.5 text-center">Points</th>
                  <th className="px-5 py-3.5 text-right">Total Charge</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono text-white text-xs font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded inline-block mb-1 border border-amber-500/20">
                        {log.jcb.plateNumber}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.logDate).toLocaleDateString("en-GB")}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{log.clientName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {log.siteLocation}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {log.startTime} - {log.endTime}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        ({log.durationHours} hrs duration)
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold text-xs border border-amber-500/20">
                        {log.points.toFixed(1)} PTS
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="font-black text-white">{formatLKR(log.totalCharge)}</span>
                      <span className="block text-[11px] text-slate-500">
                        @ {formatLKR(log.ratePerPoint)}/pt
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          log.paymentStatus === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
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
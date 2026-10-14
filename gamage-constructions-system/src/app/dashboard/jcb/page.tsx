// src/app/dashboard/jcb/page.tsx
import { getJcbMachines } from "@/app/actions/jcb";
import AddJcbModal from "@/components/AddJcbModal";
import AdminDeleteButton from "@/components/AdminDeleteButton";
import { getCurrentUser } from "@/lib/auth";
import { connection } from "next/server";
import { Truck, User, Phone, Gauge, ShieldCheck, Wrench, AlertTriangle } from "lucide-react";

export default async function JcbFleetPage() {
  await connection();
  const [machines, user] = await Promise.all([getJcbMachines(), getCurrentUser()]);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>JCB Heavy Fleet</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-amber-600 dark:text-amber-500 border border-slate-300 dark:border-slate-700">
              {machines.length} Units
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered machinery, assigned operators, and current meter telemetry.
          </p>
        </div>
        <AddJcbModal />
      </div>

      {machines.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Truck className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Machinery Registered Yet
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {machines.map((jcb) => {
            const isWorking = jcb.status === "ACTIVE";
            const inMaint = jcb.status === "MAINTENANCE";

            return (
              <div
                key={jcb.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm dark:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 font-mono font-bold text-sm">
                      {jcb.plateNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                          isWorking
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : inMaint
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isWorking && <ShieldCheck className="h-3 w-3" />}
                        {inMaint && <Wrench className="h-3 w-3" />}
                        {!isWorking && !inMaint && <AlertTriangle className="h-3 w-3" />}
                        {jcb.status}
                      </span>
                      {isAdmin && <AdminDeleteButton id={jcb.id} type="JCB" />}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    {jcb.modelName}
                  </h3>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-500 dark:text-slate-400">Driver:</span>
                      <span className="font-semibold text-slate-900 dark:text-white ml-auto">
                        {jcb.driverName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-500 dark:text-slate-400">Contact:</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300 ml-auto">
                        {jcb.driverPhone}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Gauge className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-500 dark:text-slate-400">Base Hours:</span>
                      <span className="font-mono font-semibold text-amber-600 dark:text-amber-500 ml-auto">
                        {jcb.baseMeterHours.toFixed(1)} hrs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Shift Logs: {jcb.incomeLogs.length}</span>
                  <span>Expenses: {jcb.expenseLogs.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
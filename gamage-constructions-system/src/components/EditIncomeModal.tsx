// src/components/EditIncomeModal.tsx
"use client";

import { useState, useTransition } from "react";
import { updateIncomeLog } from "@/app/actions/admin";
import { calculateFromPoints, formatLKR, RATE_PER_POINT } from "@/lib/calculations";
import { Pencil, X, Award, Loader2, Check } from "lucide-react";

interface EditIncomeModalProps {
  log: {
    id: string;
    jcbId: string;
    clientName: string;
    siteLocation: string;
    logDate: string;
    points: number;
    paymentStatus: string;
    notes?: string | null;
  };
  jcbList: { id: string; plateNumber: string; modelName: string }[];
}

export default function EditIncomeModal({ log, jcbList }: EditIncomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [points, setPoints] = useState<string>(log.points.toString());
  const calc = calculateFromPoints(points);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("id", log.id);

    startTransition(async () => {
      const res = await updateIncomeLog(formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setIsOpen(false);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => {
          setPoints(log.points.toString());
          setIsOpen(true);
        }}
        title="Admin: Edit Shift"
        className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Edit Shift Record & Points</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ID: {log.id.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Assigned JCB *
                  </label>
                  <select
                    name="jcbId"
                    defaultValue={log.jcbId}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  >
                    {jcbList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.plateNumber} ({j.modelName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Shift Date *
                  </label>
                  <input
                    type="date"
                    name="logDate"
                    defaultValue={log.logDate.split("T")[0]}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    defaultValue={log.clientName}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Site Location *
                  </label>
                  <input
                    type="text"
                    name="siteLocation"
                    defaultValue={log.siteLocation}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Dynamic Points Editor */}
              <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                    Operational Points *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    name="points"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-base font-black text-amber-600 dark:text-amber-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Calculated Total
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatLKR(calc.totalCharge)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ({calc.durationLabel} equivalent)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    name="paymentStatus"
                    defaultValue={log.paymentStatus}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Worksite Notes
                  </label>
                  <input
                    type="text"
                    name="notes"
                    defaultValue={log.notes || ""}
                    placeholder="Optional notes"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save Shift</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
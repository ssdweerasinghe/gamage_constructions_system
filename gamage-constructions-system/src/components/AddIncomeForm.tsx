// src/components/AddIncomeForm.tsx
"use client";

import { useState, useTransition } from "react";
import { createIncomeLog } from "@/app/actions/income";
import { calculatePoints, formatLKR, RATE_PER_POINT } from "@/lib/calculations";
import { Calculator, Clock, DollarSign, Calendar, MapPin, Building, CheckCircle2 } from "lucide-react";

interface JcbOption {
  id: string;
  plateNumber: string;
  modelName: string;
  driverName: string;
}

export default function AddIncomeForm({ jcbList }: { jcbList: JcbOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:30");

  const calc = calculatePoints(startTime, endTime);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createIncomeLog(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg("Income shift record saved successfully!");
        form.reset();
        setStartTime("08:00");
        setEndTime("12:30");
      }
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl text-slate-900 dark:text-white">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Log Operational Shift & Billing</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time points engine: 1.0 pt = 1 hr, 0.1 pt = 6 min @ LKR 7,000.00/pt
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Select JCB Machine *
            </label>
            <select
              name="jcbId"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Choose Equipment --</option>
              {jcbList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.plateNumber} ({j.modelName} - {j.driverName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Client / Contractor Name *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Building className="h-4 w-4" />
              </span>
              <input
                type="text"
                name="clientName"
                required
                placeholder="e.g. RDA Highway Subcontractor"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Site Location *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <MapPin className="h-4 w-4" />
              </span>
              <input
                type="text"
                name="siteLocation"
                required
                placeholder="e.g. Matara bypass, Section 2"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Shift Date *
            </label>
            <input
              type="date"
              name="logDate"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Start Time *
            </label>
            <input
              type="time"
              name="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              End Time *
            </label>
            <input
              type="time"
              name="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Status
            </label>
            <select
              name="paymentStatus"
              defaultValue="PENDING"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="PAID">PAID (Cash / Transfer)</option>
              <option value="PENDING">PENDING (Credit Invoice)</option>
              <option value="PARTIAL">PARTIAL (Advance Received)</option>
            </select>
          </div>
        </div>

        {/* Live Calculation Display Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-amber-500/30 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-3 sm:pb-0 sm:pr-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Total Shift Duration
            </span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {calc.durationHours} hrs{" "}
              <span className="text-xs text-slate-500 font-normal">({calc.totalMinutes} mins)</span>
            </p>
          </div>

          <div className="border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-3 sm:pb-0 sm:pr-4">
            <span className="text-xs text-amber-600 dark:text-amber-500 uppercase font-bold tracking-wider">
              Calculated Points
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {calc.points.toFixed(1)} <span className="text-xs text-amber-500/70 font-bold">PTS</span>
            </p>
          </div>

          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">
              Total Charge ({formatLKR(RATE_PER_POINT)}/pt)
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatLKR(calc.totalCharge)}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Shift Notes / Work Details (Optional)
          </label>
          <input
            type="text"
            name="notes"
            placeholder="e.g. Deep trench excavation and leveling"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending || jcbList.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <DollarSign className="h-4 w-4" />
            <span>{isPending ? "Computing & Recording..." : "Confirm & Save Shift Log"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
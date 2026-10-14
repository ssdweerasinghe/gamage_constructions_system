// src/components/AddIncomeForm.tsx
"use client";

import { useState, useTransition } from "react";
import { createIncomeLog } from "@/app/actions/income";
import { calculateFromPoints, formatLKR, RATE_PER_POINT } from "@/lib/calculations";
import {
  Award,
  DollarSign,
  Calendar,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

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

  // Default to 1.0 Point
  const [points, setPoints] = useState<string>("1.0");

  const calc = calculateFromPoints(points);

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
        setSuccessMsg(`Shift recorded: ${calc.points.toFixed(1)} Points -> ${formatLKR(calc.totalCharge)}`);
        form.reset();
        setPoints("1.0");
      }
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Log Shift Operational Points</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Points-based machinery rate: <strong>1.0 pt = LKR 7,000.00</strong> (0.1 pt = 6 mins)
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Core Logistics */}
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
              Client / Contractor *
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

        {/* PRIMARY POINTS ENGINE INPUT CARD */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border-2 border-amber-500/40 rounded-2xl p-5 shadow-inner">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* The Main Input */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Operational Points (PTS) *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  name="points"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  required
                  placeholder="e.g. 2.5"
                  className="w-full bg-white dark:bg-slate-900 border-2 border-amber-500/60 rounded-xl px-4 py-3 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
                  Points
                </span>
              </div>
              {/* Quick Increment Buttons */}
              <div className="flex gap-1.5 mt-2">
                {[0.5, 1.0, 2.0, 4.0, 8.0].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setPoints(quick.toFixed(1))}
                    className="px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500 transition-colors"
                  >
                    +{quick}
                  </button>
                ))}
              </div>
            </div>

            {/* Equivalent Duration Computed */}
            <div className="lg:col-span-3 text-center lg:text-left border-y lg:border-y-0 lg:border-x border-slate-200 dark:border-slate-800 py-3 lg:py-0 lg:px-5">
              <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Equivalent Work Time</span>
              </span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {calc.durationLabel}
              </p>
              <span className="text-xs text-slate-500 font-normal">
                ({calc.equivalentMinutes} minutes total)
              </span>
            </div>

            {/* Live Total Billable Amount */}
            <div className="lg:col-span-4 text-center lg:text-right">
              <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Total Charge ({formatLKR(RATE_PER_POINT)}/pt)
              </span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
                {formatLKR(calc.totalCharge)}
              </p>
              <span className="text-xs text-slate-400 font-medium">
                {calc.points.toFixed(1)} pts &times; LKR 7,000.00
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Date, Payment, and Optional Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Shift Date *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="date"
                name="logDate"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
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
              <option value="PAID">PAID (Settled)</option>
              <option value="PENDING">PENDING (Credit Invoice)</option>
              <option value="PARTIAL">PARTIAL (Advance Received)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Worksite Notes (Optional)
            </label>
            <input
              type="text"
              name="notes"
              placeholder="e.g. Canal excavation, leveling"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending || jcbList.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <DollarSign className="h-4 w-4" />
            <span>{isPending ? "Recording Points..." : "Save Shift Points & Billing"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
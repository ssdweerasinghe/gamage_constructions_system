// src/app/login/page.tsx
"use client";

import { useActionState } from "react";
import { loginOwner } from "@/app/actions/auth";
import { Lock, Mail, ShieldAlert, Truck } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginOwner, null);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
            <Truck className="h-8 w-8 text-slate-950" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          Gamage Constructions
        </h2>
        <p className="mt-1 text-center text-sm font-medium text-amber-500 uppercase tracking-widest">
          Executive Fleet & Profit Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700/60">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Owner Email Address
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  defaultValue="owner@gamageconstructions.lk"
                  required
                  placeholder="owner@gamageconstructions.lk"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  defaultValue="Gamage@2026"
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
              {isPending ? "Authenticating..." : "Sign In to Command Center"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-700/60 pt-4 text-center">
            <p className="text-xs text-slate-500">
              Authorized Owner Access Only &bull; 256-bit Encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
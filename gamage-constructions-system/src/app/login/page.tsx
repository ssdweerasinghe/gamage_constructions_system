// src/app/login/page.tsx
"use client";

import { useState, useActionState } from "react";
import { loginUser } from "@/app/actions/auth";
import ThemeToggle from "@/components/ThemeToggle";
import { Lock, Mail, ShieldAlert, Truck, ShieldCheck, UserCheck } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const [selectedRole, setSelectedRole] = useState<"OWNER" | "ADMIN">("OWNER");

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Light / Dark Mode Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
            <Truck className="h-8 w-8 text-slate-950" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Gamage Constructions
        </h2>
        <p className="mt-1 text-center text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
          Fleet & Accounting Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole("OWNER")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedRole === "OWNER"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Owner Portal</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("ADMIN")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedRole === "ADMIN"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Portal</span>
            </button>
          </div>

          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {selectedRole === "ADMIN" ? "Admin Email Address" : "Owner Email Address"}
              </label>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  key={selectedRole + "-email"}
                  type="email"
                  name="email"
                  required
                  placeholder={
                    selectedRole === "ADMIN"
                      ? "admin@gamageconstructions.lk"
                      : "owner@gamageconstructions.lk"
                  }
                  autoComplete="email"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  key={selectedRole + "-pwd"}
                  type="password"
                  name="password"
                  required
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-slate-950 transition-all active:scale-[0.98] ${
                selectedRole === "ADMIN"
                  ? "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20"
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
              }`}
            >
              {isPending
                ? "Verifying Credentials..."
                : selectedRole === "ADMIN"
                ? "Sign In as Administrator"
                : "Sign In as Owner"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Authorized Access Only &bull; Gamage Constructions PVT. (LTD.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/app/dashboard/layout.tsx
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Truck,
  DollarSign,
  TrendingDown,
  LogOut,
  Building2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  const navigation = [
    { name: "Executive Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "JCB Machinery Fleet", href: "/dashboard/jcb", icon: Truck },
    { name: "Operational Income", href: "/dashboard/income", icon: DollarSign },
    { name: "Fleet Expenses", href: "/dashboard/expenses", icon: TrendingDown },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="bg-amber-500 p-2.5 rounded-xl shadow-md shadow-amber-500/20">
              <Building2 className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">Gamage</h1>
              <span className="text-xs text-amber-500 font-semibold tracking-wider uppercase">
                Constructions
              </span>
            </div>
          </div>

          {/* User Profile / Role Card */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg border ${
                  isAdmin
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}
              >
                {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || "User"}</p>
                <span
                  className={`inline-block text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                    isAdmin
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {user?.role || "GUEST"}
                </span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
                >
                  <Icon className="h-5 w-5 text-amber-500 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950">
        {children}
      </main>
    </div>
  );
}
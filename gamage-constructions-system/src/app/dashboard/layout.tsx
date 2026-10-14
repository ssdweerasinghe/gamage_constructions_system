// src/app/dashboard/layout.tsx
import Link from "next/link";
import { logoutOwner } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Truck,
  DollarSign,
  TrendingDown,
  LogOut,
  Building2,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = [
    { name: "Executive Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "JCB Machinery Fleet", href: "/dashboard/jcb", icon: Truck },
    { name: "Operational Income", href: "/dashboard/income", icon: DollarSign },
    { name: "Fleet Expenses", href: "/dashboard/expenses", icon: TrendingDown },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="bg-amber-500 p-2.5 rounded-xl shadow-md shadow-amber-500/20">
              <Building2 className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight tracking-tight">
                Gamage
              </h1>
              <span className="text-xs text-amber-500 font-semibold tracking-wider uppercase">
                Constructions
              </span>
            </div>
          </div>

          {/* Links */}
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

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <form action={logoutOwner}>
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

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950">
        {children}
      </main>
    </div>
  );
}
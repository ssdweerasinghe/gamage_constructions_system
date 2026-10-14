// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Executive Command Center
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Welcome back, Mr. Gamage. Fleet telemetry & profit reports will load here.
        </p>
      </div>
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400">
        Step 1 Shell is Ready! In Step 2 we will connect the JCB Machinery Registry.
      </div>
    </div>
  );
}
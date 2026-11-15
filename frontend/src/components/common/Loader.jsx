export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
      </div>
      <p className="text-slate-400 text-sm animate-pulse">Loading energy telemetry...</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 animate-pulse space-y-4">
      <div className="h-4 bg-slate-800 rounded w-1/3"></div>
      <div className="h-8 bg-slate-800 rounded w-1/2"></div>
      <div className="h-3 bg-slate-800 rounded w-2/3"></div>
    </div>
  );
}

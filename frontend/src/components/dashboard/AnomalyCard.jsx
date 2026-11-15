import { Link } from "react-router-dom";

export function AnomalyCard({ activeCount }) {
  return (
    <div className={`p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border ${activeCount > 0 ? 'border-rose-500/20 hover:border-rose-500/40' : 'border-slate-800 hover:border-slate-700'} flex flex-col justify-between h-48 transition duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase font-mono">
            ACTIVE ANOMALIES
          </span>
          <h3 className={`text-3xl font-extrabold mt-2 font-sans tracking-tight ${activeCount > 0 ? 'text-rose-400' : 'text-white'}`}>
            {activeCount} <span className="text-sm font-medium text-slate-400">{activeCount === 1 ? 'Alert' : 'Alerts'}</span>
          </h3>
        </div>
        <div className={`p-2 rounded-xl border ${activeCount > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <div className="border-t border-slate-800/40 pt-4 flex justify-between items-center text-xs">
        <span className="text-slate-500 font-mono">
          {activeCount > 0 ? "Immediate action advised" : "System health: Optimal"}
        </span>
        <Link to="/anomalies" className="text-rose-400 font-medium hover:underline flex items-center">
          Details
          <svg className="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default AnomalyCard;

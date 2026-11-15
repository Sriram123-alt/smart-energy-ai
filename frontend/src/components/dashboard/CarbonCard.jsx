import { Link } from "react-router-dom";

export function CarbonCard({ carbonToday }) {
  // Simple offset metric: daily solar offset translates to avoided emissions. Let's calculate
  const avoidedCO2 = (carbonToday * 0.35).toFixed(1);
  const treesEquiv = Math.max(1, Math.round(parseFloat(avoidedCO2) * 0.2));

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between h-48 hover:border-violet-500/40 transition duration-300">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase font-mono">
            AVOIDED CARBON TODAY
          </span>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-sans tracking-tight">
            {avoidedCO2} <span className="text-sm font-medium text-slate-400">kg CO₂</span>
          </h3>
        </div>
        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      <div className="border-t border-slate-800/40 pt-4 flex justify-between items-center text-xs">
        <div>
          <span className="text-slate-500 font-mono">Equivalent:</span>
          <span className="text-violet-400 font-bold ml-1">{treesEquiv} {treesEquiv === 1 ? 'tree' : 'trees'} planted</span>
        </div>
        <Link to="/carbon" className="text-violet-400 font-medium hover:underline flex items-center">
          Carbon Hub
          <svg className="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default CarbonCard;

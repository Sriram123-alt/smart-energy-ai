import { Link } from "react-router-dom";

export function ForecastCard({ usageToday }) {
  // Simulating a forecast usage that is slightly higher or lower based on today's state
  const tomorrowForecastKWh = (usageToday * 1.05).toFixed(1);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between h-48 hover:border-cyan-500/40 transition duration-300">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase font-mono">
            TOMORROW'S FORECAST
          </span>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-sans tracking-tight">
            {tomorrowForecastKWh} <span className="text-sm font-medium text-slate-400">kWh</span>
          </h3>
        </div>
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div className="border-t border-slate-800/40 pt-4 flex justify-between items-center text-xs">
        <span className="text-slate-500 font-mono">
          Based on 78°F sunny outlook
        </span>
        <Link to="/forecast" className="text-cyan-400 font-medium hover:underline flex items-center">
          Predictions
          <svg className="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default ForecastCard;

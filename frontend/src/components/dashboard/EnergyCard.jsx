

export function EnergyCard({ currentDraw, usageToday, solarGeneration }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between h-48 hover:border-emerald-500/40 transition duration-300">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase font-mono">
            REAL-TIME ENERGY DRAW
          </span>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-sans tracking-tight">
            {currentDraw} <span className="text-sm font-medium text-slate-400">kW</span>
          </h3>
        </div>
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      <div className="border-t border-slate-800/40 pt-4 flex justify-between items-center text-xs">
        <div>
          <span className="text-slate-500 font-mono">Daily Total:</span>
          <span className="text-slate-200 font-bold ml-1">{usageToday} kWh</span>
        </div>
        {solarGeneration > 0 && (
          <div className="flex items-center text-emerald-400 font-medium">
            <svg className="w-3.5 h-3.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>{solarGeneration} kW Solar</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnergyCard;

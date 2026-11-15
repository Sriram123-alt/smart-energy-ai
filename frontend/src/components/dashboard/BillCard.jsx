

export function BillCard({ costToday, gridIndependence }) {
  // Monthly projected cost: daily cost * 30 days
  const projectedMonthlyBill = (costToday * 30).toFixed(2);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between h-48 hover:border-amber-500/40 transition duration-300">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase font-mono">
            ESTIMATED DAILY COST
          </span>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-sans tracking-tight">
            ${costToday.toFixed(2)}
          </h3>
        </div>
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V5" />
          </svg>
        </div>
      </div>

      <div className="border-t border-slate-800/40 pt-4 flex justify-between items-center text-xs">
        <div>
          <span className="text-slate-500 font-mono">Projected:</span>
          <span className="text-amber-400 font-bold ml-1">${projectedMonthlyBill}/mo</span>
        </div>
        <div className="text-slate-400 font-medium font-mono">
          {gridIndependence}% Solar Offset
        </div>
      </div>
    </div>
  );
}

export default BillCard;

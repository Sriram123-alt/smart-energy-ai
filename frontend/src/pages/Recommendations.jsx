import { useState, useEffect, useCallback } from "react";
import { recommendationService } from "../services/recommendationService";
import { Loader } from "../components/common/Loader";

export function Recommendations() {
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);
  const [savings, setSavings] = useState({ daily: 0, monthly: 0 });
  const [filter, setFilter] = useState("all");

  const loadData = useCallback(async () => {
    const data = await recommendationService.getRecommendations();
    const currentSavings = recommendationService.getAppliedSavings();
    setTimeout(() => {
      setRecs(data);
      setSavings(currentSavings);
      setLoading(false);
    }, 0);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (id) => {
    const updated = await recommendationService.toggleRecommendation(id);
    setRecs(updated);
    setSavings(recommendationService.getAppliedSavings());
  };

  const filteredRecs = recs.filter((rec) => {
    if (filter === "all") return true;
    return rec.difficulty.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Optimization Recommendations</h1>
          <p className="text-slate-400 text-xs mt-1">Check recommendations to integrate them into automated scheduling and offset estimates</p>
        </div>
      </div>

      {/* Aggregate Savings Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900/60 to-slate-900/60 border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h4 className="text-sm font-semibold text-emerald-400">Active Daily Savings Meter</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            By implementing the selected recommendations below, you offset grid demands and save on utility delivery fees.
          </p>
        </div>
        <div className="flex items-center space-x-6 shrink-0 font-mono">
          <div className="text-left">
            <span className="text-[9px] text-slate-500 uppercase block font-bold">DAILY RATE</span>
            <span className="text-xl font-extrabold text-white">${savings.daily.toFixed(2)}</span>
          </div>
          <div className="text-left border-l border-slate-800 pl-6">
            <span className="text-[9px] text-slate-500 uppercase block font-bold">EST. MONTHLY OFFSET</span>
            <span className="text-xl font-extrabold text-emerald-400">${savings.monthly.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Difficulty Filters */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-5">
          {["all", "easy", "medium", "hard"].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setFilter(difficulty)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase font-mono tracking-wider transition cursor-pointer border ${
                filter === difficulty
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-slate-950/20 text-slate-500 border-slate-850 hover:text-slate-400"
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>

        {/* Recommendations list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecs.map((rec) => (
            <div 
              key={rec.id}
              onClick={() => handleToggle(rec.id)}
              className={`p-6 rounded-2xl border transition duration-300 relative flex flex-col justify-between cursor-pointer ${
                rec.applied 
                  ? "bg-slate-900/60 border-emerald-500/20 shadow-md shadow-emerald-500/[0.01]" 
                  : "bg-slate-950/20 border-slate-900 hover:border-slate-800"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    rec.difficulty === "Easy" 
                      ? "bg-emerald-950/40 text-emerald-400" 
                      : rec.difficulty === "Medium"
                        ? "bg-amber-950/40 text-amber-400"
                        : "bg-rose-950/40 text-rose-400"
                  }`}>
                    {rec.difficulty}
                  </span>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                    rec.applied ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-850 bg-slate-950"
                  }`}>
                    {rec.applied && (
                      <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <h3 className={`text-base font-bold transition ${rec.applied ? 'text-white' : 'text-slate-400'}`}>
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="border-t border-slate-900 mt-6 pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">Potential Savings:</span>
                <span className="text-emerald-400 font-bold font-mono">+${rec.savingsMonthly.toFixed(2)}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;

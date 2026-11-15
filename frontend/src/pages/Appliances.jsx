import { useState, useEffect, useCallback } from "react";
import { applianceService } from "../services/applianceService";
import { Loader } from "../components/common/Loader";

export function Appliances() {
  const [loading, setLoading] = useState(true);
  const [appliances, setAppliances] = useState([]);
  const [filter, setFilter] = useState("all");

  const loadAppliances = useCallback(async () => {
    const data = await applianceService.getAppliances();
    setTimeout(() => {
      setAppliances(data);
      setLoading(false);
    }, 0);
  }, []);

  useEffect(() => {
    loadAppliances();
  }, [loadAppliances]);

  const handleToggle = async (id) => {
    await applianceService.toggleAppliance(id);
    await loadAppliances();
  };

  const handleLimitChange = async (id, val) => {
    await applianceService.updateApplianceLimit(id, val);
    await loadAppliances();
  };

  const handleConsChange = async (id, val) => {
    await applianceService.updateApplianceConsumption(id, val);
    await loadAppliances();
  };

  const filteredAppliances = appliances.filter((app) => {
    if (filter === "all") return true;
    if (filter === "active") return app.status;
    return app.type === filter;
  });

  // Calculate stats
  const totalLoadW = appliances
    .filter(a => a.status && a.id !== "app_solar")
    .reduce((sum, a) => sum + a.consumption, 0);

  const solarInverter = appliances.find(a => a.id === "app_solar");
  const solarGenW = solarInverter && solarInverter.status ? Math.abs(solarInverter.consumption) : 0;

  const netGridW = totalLoadW - solarGenW;

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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Appliances</h1>
          <p className="text-slate-400 text-xs mt-1">Remote control, load caps, and power draw telemetry</p>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">TOTAL DEVICE DEMAND</span>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-sans tracking-tight">
            {(totalLoadW / 1000).toFixed(2)} <span className="text-sm font-medium text-slate-500">kW</span>
          </h3>
          <span className="text-[10px] text-slate-500 mt-2">Combined load of all active appliances</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-emerald-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase">SOLAR CO-GENERATION</span>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2 font-sans tracking-tight">
            {(solarGenW / 1000).toFixed(2)} <span className="text-sm font-medium text-emerald-500/50">kW</span>
          </h3>
          <span className="text-[10px] text-emerald-450 mt-2">Green power generated locally</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">NET GRID DEMAND</span>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-sans tracking-tight">
            {(netGridW / 1000).toFixed(2)} <span className="text-sm font-medium text-slate-500">kW</span>
          </h3>
          <span className="text-[10px] text-slate-505 mt-2">Net utility intake drawing from substation</span>
        </div>
      </div>

      {/* Filter and appliances cards */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-5">
          {["all", "active", "cooling", "appliance", "ev", "solar", "laundry", "lighting"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase font-mono tracking-wider transition cursor-pointer border ${
                filter === type
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-slate-950/20 text-slate-500 border-slate-850 hover:text-slate-400"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Appliance grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppliances.map((app) => (
            <div 
              key={app.id} 
              className={`p-6 rounded-2xl border transition duration-300 relative flex flex-col justify-between ${
                app.status 
                  ? "bg-slate-900/60 border-slate-800/80 shadow-lg shadow-emerald-500/[0.01]" 
                  : "bg-slate-950/20 border-slate-900/60"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className={`text-base font-bold transition ${app.status ? 'text-white' : 'text-slate-500'}`}>
                      {app.name}
                    </h3>
                    <span className="text-[9px] tracking-wider text-slate-500 font-bold uppercase font-mono mt-1 block">
                      {app.location}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleToggle(app.id)}
                    className={`w-12 h-6 rounded-full p-0.5 transition cursor-pointer ${
                      app.status ? "bg-emerald-500" : "bg-slate-800"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                      app.status ? "translate-x-6" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {app.status && (
                  <div className="space-y-5">
                    {/* Real-time draw slider (only show for variable appliances like AC or EV) */}
                    {["cooling", "ev", "solar"].includes(app.type) && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400 uppercase font-bold">Adjust Draw (Watts)</span>
                          <span className="text-slate-200 font-bold">{Math.abs(app.consumption)} W</span>
                        </div>
                        <input 
                          type="range" 
                          min={app.type === "solar" ? -4000 : 100}
                          max={app.type === "solar" ? -500 : 4000}
                          value={app.consumption}
                          onChange={(e) => handleConsChange(app.id, e.target.value)}
                          className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    )}

                    {/* Limit threshold slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 uppercase font-bold">Safety Load Cap</span>
                        <span className="text-slate-200 font-bold">{app.limit} W</span>
                      </div>
                      <input 
                        type="range" 
                        min="500"
                        max="8000"
                        step="100"
                        value={app.limit}
                        onChange={(e) => handleLimitChange(app.id, e.target.value)}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-slate-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {app.status ? (
                <div className="border-t border-slate-850 mt-6 pt-4 flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>Current Draw:</span>
                  <span className={`font-bold font-mono ${app.consumption < 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {app.consumption < 0 ? `-${Math.abs(app.consumption)}` : app.consumption} W
                  </span>
                </div>
              ) : (
                <div className="border-t border-slate-950 mt-6 pt-4 flex justify-between items-center text-xs text-slate-600 font-mono">
                  <span>Status:</span>
                  <span>STANDBY (OFF)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Appliances;

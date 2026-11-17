import { useState, useEffect } from "react";
import { energyService } from "../services/energyService";
import { anomalyService } from "../services/anomalyService";
import { applianceService } from "../services/applianceService";
import { recommendationService } from "../services/recommendationService";
import { EnergyCard } from "../components/dashboard/EnergyCard";
import { AnomalyCard } from "../components/dashboard/AnomalyCard";
import { CarbonCard } from "../components/dashboard/CarbonCard";
import { ForecastCard } from "../components/dashboard/ForecastCard";
import { BillCard } from "../components/dashboard/BillCard";
import { EnergyChart } from "../components/charts/EnergyChart";
import { CostChart } from "../components/charts/CostChart";
import { Loader } from "../components/common/Loader";
import { Link } from "react-router-dom";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState(null);
  const [loadCurve, setLoadCurve] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [activeAnomalies, setActiveAnomalies] = useState(0);
  const [appliances, setAppliances] = useState([]);
  const [recentRecs, setRecentRecs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await energyService.getTodaySummary();
        const curve = await energyService.getHourlyLoadCurve();
        const bills = await energyService.getMonthlyBillHistory();
        const devices = await applianceService.getAppliances();
        const recs = await recommendationService.getRecommendations();
        
        setTimeout(() => {
          setTodayData(summary);
          setLoadCurve(curve);
          setBillHistory(bills);
          setAppliances(devices);
          setRecentRecs(recs.filter(r => !r.applied).slice(0, 2));
          setActiveAnomalies(anomalyService.getActiveCount());
          setLoading(false);
        }, 0);
      } catch (e) {
        console.error("Failed to load dashboard statistics", e);
        setTimeout(() => setLoading(false), 0);
      }
    };

    fetchData();

    // Set up real-time telemetry updates every 5 seconds
    const interval = setInterval(async () => {
      try {
        const live = await energyService.getRealtimeMetrics();
        setTodayData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            currentDraw: live.gridDrawKW,
            solarGeneration: live.solarGenerationKW,
          };
        });
        // Keep anomalies count updated
        const anomData = await anomalyService.getAnomalies();
        setActiveAnomalies(anomData.filter(a => !a.resolved).length);
      } catch {
        // silently skip polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  const handleDeviceToggle = async (id) => {
    await applianceService.toggleAppliance(id);
    const updatedDevices = await applianceService.getAppliances();
    setAppliances(updatedDevices);
    
    // Instantly update the metrics card
    const live = await energyService.getRealtimeMetrics();
    if (live) {
      setTodayData(prev => ({
        ...prev,
        currentDraw: live.gridDrawKW ?? prev?.currentDraw,
        solarGeneration: live.solarGenerationKW ?? prev?.solarGeneration
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19]">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Energy Director</h1>
          <p className="text-slate-400 text-xs mt-1">Autonomous consumption optimization & load management</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-semibold text-slate-300 font-mono">LIVE TELEMETRY STREAMING</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <EnergyCard 
          currentDraw={todayData.currentDraw} 
          usageToday={todayData.usageToday}
          solarGeneration={todayData.solarGeneration}
        />
        <AnomalyCard activeCount={activeAnomalies} />
        <CarbonCard carbonToday={todayData.carbonToday} gridIndependence={todayData.gridIndependence} />
        <ForecastCard usageToday={todayData.usageToday} />
        <BillCard costToday={todayData.costToday} gridIndependence={todayData.gridIndependence} />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <EnergyChart data={loadCurve} />
        <CostChart data={billHistory} />
      </div>

      {/* Lower Hub Control Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Appliances Quick Toggle */}
        <div className="xl:col-span-2 p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-300">Quick Smart Controls</h4>
                <p className="text-xs text-slate-500">Toggle active smart-plugs and loads</p>
              </div>
              <Link to="/appliances" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                Manage Devices →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {appliances.slice(0, 6).map((app) => (
                <div 
                  key={app.id} 
                  className={`p-4 rounded-xl border transition ${
                    app.status 
                      ? "bg-slate-950/40 border-emerald-500/20 text-white" 
                      : "bg-slate-950/20 border-slate-800/80 text-slate-400"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold truncate max-w-[120px]">{app.name}</span>
                    <button 
                      onClick={() => handleDeviceToggle(app.id)}
                      className={`w-9 h-5 rounded-full p-0.5 transition cursor-pointer ${
                        app.status ? "bg-emerald-500" : "bg-slate-800"
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition transform ${
                        app.status ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{app.location}</span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {app.status ? `${app.consumption}W` : "OFF"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations Highlights */}
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-300">AI Optimization</h4>
                <p className="text-xs text-slate-500">Unapplied opportunities to save</p>
              </div>
              <Link to="/recommendations" className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                All Tips →
              </Link>
            </div>

            <div className="space-y-4">
              {recentRecs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Great job! All current optimization recommendations applied.
                </div>
              ) : (
                recentRecs.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700/80 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-200">{rec.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/20 px-1.5 py-0.5 rounded">
                        +${rec.savingsMonthly}/mo
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{rec.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

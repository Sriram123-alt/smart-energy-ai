import { useState, useEffect } from "react";
import { forecastService } from "../services/forecastService";
import { ForecastChart } from "../components/charts/ForecastChart";
import { Loader } from "../components/common/Loader";

export function Forecasting() {
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState([]);
  const [tempOffset, setTempOffset] = useState(0);

  useEffect(() => {
    const fetchForecast = async (offset) => {
      const data = await forecastService.get7DayForecast(offset);
      setTimeout(() => {
        setForecastData(data);
        setLoading(false);
      }, 0);
    };
    fetchForecast(tempOffset);
  }, [tempOffset]);

  // Calculations
  const totalWeeklySolar = forecastData.reduce((sum, d) => sum + d.predictedSolar, 0);
  const netWeeklyGrid = forecastData.reduce((sum, d) => sum + d.gridNet, 0);

  // Find peak usage day
  const peakDayObj = forecastData.reduce((max, d) => d.predictedUsage > (max?.predictedUsage || 0) ? d : max, null);

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Forecasting</h1>
        <p className="text-slate-400 text-xs mt-1">Predictive energy profiling modeled on occupancy patterns and regional weather inputs</p>
      </div>

      {/* Grid Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">WEEKLY GRID INTAKE PROJECTION</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-white">{netWeeklyGrid.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-mono">kWh</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2">Estimated consumption after solar offsets</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase font-semibold">WEEKLY SOLAR GENERATION</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">{totalWeeklySolar.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-mono">kWh</span>
          </div>
          <span className="text-[10px] text-emerald-500/80 mt-2 font-medium">Estimated clean energy output</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">PREDICTED PEAK DEMAND</span>
          {peakDayObj ? (
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-3xl font-extrabold text-rose-400">{peakDayObj.predictedUsage.toFixed(1)}</span>
              <span className="text-xs text-slate-500 font-mono">kWh ({peakDayObj.day})</span>
            </div>
          ) : (
            <span className="text-white mt-2">Loading...</span>
          )}
          <span className="text-[10px] text-slate-500 mt-2">Max predicted load window</span>
        </div>
      </div>

      {/* Temperature Sensitivity Control Widget */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold text-slate-300">Weather-Demand Sensitivity Simulator</h4>
            <p className="text-xs text-slate-500">Inject heatwaves or cold spells to watch estimated cooling draw shift</p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/30 border border-cyan-500/10 px-3 py-1 rounded-full">
            {tempOffset > 0 ? `+${tempOffset}` : tempOffset}°F Outlook Anomaly
          </span>
        </div>

        <div className="space-y-2">
          <input 
            type="range"
            min="-10"
            max="12"
            value={tempOffset}
            onChange={(e) => setTempOffset(Number(e.target.value))}
            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[9px] font-bold text-slate-500 font-mono">
            <span>-10°F COOL WAVE</span>
            <span>BASE SPECIFICATION</span>
            <span>+12°F HEAT WAVE</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full">
        {loading ? <Loader /> : <ForecastChart data={forecastData} />}
      </div>
    </div>
  );
}

export default Forecasting;

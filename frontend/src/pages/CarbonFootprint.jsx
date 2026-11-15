import { useState } from "react";
import { CarbonChart } from "../components/charts/CarbonChart";

export function CarbonFootprint() {
  const [habits, setHabits] = useState([
    { id: "h1", name: "Use cold water for washing clothes", co2Saving: 12.5, active: false },
    { id: "h2", name: "Line dry clothes instead of heating dryer", co2Saving: 24.0, active: false },
    { id: "h3", name: "Unplug chargers and entertainment units overnight", co2Saving: 8.5, active: false },
    { id: "h4", name: "Set thermostat to 78°F during summer nights", co2Saving: 18.0, active: false },
    { id: "h5", name: "Switch off desktop computer when done working", co2Saving: 10.2, active: false }
  ]);

  const toggleHabit = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, active: !h.active } : h));
  };

  // Calculations
  const baseEmissions = 320; // kg CO2 / month
  const solarOffset = 110; // kg CO2 / month
  const habitSavings = habits.filter(h => h.active).reduce((sum, h) => sum + h.co2Saving, 0);
  const totalSavings = solarOffset + habitSavings;
  const netEmissions = Math.max(0, baseEmissions - totalSavings);
  const offsetRate = ((totalSavings / baseEmissions) * 100).toFixed(0);

  // Trees equivalent: 1 tree absorbs ~20kg CO2 per year, so ~1.67kg CO2 per month
  const monthlyTreeAbsorb = 1.67;
  const treeEquiv = (totalSavings / monthlyTreeAbsorb).toFixed(1);

  // Goal metrics
  const targetSavings = 250; // kg CO2
  const progressPercent = Math.min(100, (totalSavings / targetSavings) * 100).toFixed(0);

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Carbon Footprint Registry</h1>
        <p className="text-slate-400 text-xs mt-1">Track greenhouse gas reductions and environmental offsetting goals</p>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">EST. BASELINE FOOTPRINT</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-white">{baseEmissions}</span>
            <span className="text-xs text-slate-500 font-mono">kg CO₂/mo</span>
          </div>
          <span className="text-[10px] text-slate-505 mt-2">Mitigation Rate: <strong className="text-emerald-400">{offsetRate}%</strong></span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-violet-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-violet-400 font-bold font-mono uppercase font-semibold">TOTAL AVOIDED EMISSIONS</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-violet-400">{totalSavings.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-mono">kg CO₂/mo</span>
          </div>
          <span className="text-[10px] text-violet-500/80 mt-2 font-medium">Solar offset + habit savings</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">NET CARBON FOOTPRINT</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-white">{netEmissions.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-mono">kg CO₂/mo</span>
          </div>
          <span className="text-[10px] text-slate-505 mt-2">Actual environmental contribution</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-emerald-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase">NET FOREST EQUIVALENCY</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">{treeEquiv}</span>
            <span className="text-xs text-slate-500 font-mono">trees</span>
          </div>
          <span className="text-[10px] text-emerald-450 mt-2">Annualized offset in mature pine trees</span>
        </div>
      </div>

      {/* Visual Progress Goal bar */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase">Sustainability Goal Progress</span>
          <span className="text-violet-400 font-bold">{totalSavings.toFixed(0)} / {targetSavings} kg target ({progressPercent}%)</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div 
            style={{ width: `${progressPercent}%` }} 
            className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Chart and Calculator Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CarbonChart />
        </div>

        {/* Habit Calculator */}
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-1">Carbon Habit Planner</h4>
            <p className="text-xs text-slate-500 mb-6">Select minor behaviors to increase monthly carbon offset</p>

            <div className="space-y-3.5">
              {habits.map((habit) => (
                <div 
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    habit.active 
                      ? "bg-slate-950/45 border-violet-500/20 text-white" 
                      : "bg-slate-950/15 border-slate-850 text-slate-400 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center space-x-3 pr-2">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                      habit.active ? "bg-violet-500 border-violet-500" : "border-slate-700 bg-slate-950"
                    }`}>
                      {habit.active && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] font-medium leading-normal">{habit.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-violet-400 whitespace-nowrap">
                    -{habit.co2Saving} kg
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-850/60 pt-4 mt-6 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">Habits Mitigation:</span>
            <span className="text-violet-400 font-bold font-mono">-{habitSavings.toFixed(1)} kg CO₂/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarbonFootprint;

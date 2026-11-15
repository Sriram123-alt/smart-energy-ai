import { useState } from "react";

export function WhatIfSimulator() {
  // Load initial settings
  // Load initial settings lazily
  const [thermostat, setThermostat] = useState(() => {
    const saved = localStorage.getItem("energy_simulator");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.thermostat || 72;
      } catch {
        return 72;
      }
    }
    return 72;
  });

  const [solar, setSolar] = useState(() => {
    const saved = localStorage.getItem("energy_simulator");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.solarInstalled || 4;
      } catch {
        return 4;
      }
    }
    return 4;
  });

  const [evSchedule, setEvSchedule] = useState(() => {
    const saved = localStorage.getItem("energy_simulator");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.evSchedule || "offpeak";
      } catch {
        return "offpeak";
      }
    }
    return "offpeak";
  });

  const saveSettings = (temp, sol, ev) => {
    localStorage.setItem("energy_simulator", JSON.stringify({
      thermostat: temp,
      solarInstalled: sol,
      evSchedule: ev
    }));
  };

  const handleTempChange = (val) => {
    setThermostat(val);
    saveSettings(val, solar, evSchedule);
  };

  const handleSolarChange = (val) => {
    setSolar(val);
    saveSettings(thermostat, val, evSchedule);
  };

  const handleEvChange = (val) => {
    setEvSchedule(val);
    saveSettings(thermostat, solar, val);
  };

  // Calculations based on sliders
  const baseBill = 135;
  const acMultiplier = (72 - thermostat) * 6.5; // lower temp = higher bill
  const solarCredit = solar * 14.8; // solar offsets bill
  const evChargeCost = evSchedule === "peak" ? 38.0 : evSchedule === "offpeak" ? 9.5 : 16.0;
  
  const projectedBill = Math.max(15, baseBill + acMultiplier - solarCredit + evChargeCost);

  const baseCarbon = 290;
  const acCarbonOffset = (72 - thermostat) * 11.2;
  const solarCarbonCredit = solar * 26.5;
  const evCarbonCost = evSchedule === "peak" ? 75.0 : evSchedule === "offpeak" ? 18.0 : 32.0;

  const projectedCarbon = Math.max(0, baseCarbon + acCarbonOffset - solarCarbonCredit + evCarbonCost);
  
  const solarOutputWeekly = solar * 24.5;
  const houseUsageWeekly = 180 + acCarbonOffset + evCarbonCost;
  const gridIndependence = Math.min(100, Math.max(0, Math.round((solarOutputWeekly / houseUsageWeekly) * 100)));

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">What-If Simulator</h1>
        <p className="text-slate-400 text-xs mt-1">Simulate infrastructure upgrades and thermal setpoints to forecast financial and ecological gains</p>
      </div>

      {/* Simulator Widgets and Gauge Outputs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Sliders Control Panel */}
        <div className="xl:col-span-2 p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Adjustment Parameters</h3>
            <p className="text-xs text-slate-500">Slide parameters to re-calculate carbon footprint and utility bill</p>
          </div>

          <div className="space-y-6">
            {/* Slider 1: Thermostat */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Thermostat Setpoint</span>
                <span className="text-emerald-400 font-bold text-sm bg-emerald-950/20 px-2 py-0.5 rounded">
                  {thermostat}°F
                </span>
              </div>
              <input 
                type="range"
                min="65"
                max="82"
                value={thermostat}
                onChange={(e) => handleTempChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-550 font-mono">
                <span>65°F (HIGH COOLING DRAW)</span>
                <span>72°F (NOMINAL)</span>
                <span>82°F (ECO MODERATE)</span>
              </div>
            </div>

            {/* Slider 2: Solar Panels */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Solar Panel Array Capacity</span>
                <span className="text-cyan-400 font-bold text-sm bg-cyan-950/20 px-2 py-0.5 rounded">
                  {solar} kW
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="16"
                step="1"
                value={solar}
                onChange={(e) => handleSolarChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-550 font-mono">
                <span>NO SOLAR PANEL (0 kW)</span>
                <span>8 kW STANDARD</span>
                <span>16 kW COMMERCIAL MAX</span>
              </div>
            </div>

            {/* Slider 3: EV Charging scheduling */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-300 font-bold uppercase block">
                EV Charger Charging Schedule
              </label>
              <select
                value={evSchedule}
                onChange={(e) => handleEvChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500 transition text-xs font-semibold"
              >
                <option value="peak">Peak Hours Charging (04:00 PM - 09:00 PM) - $0.32/kWh</option>
                <option value="eco">Eco Smart Charging (Solar tracking daylight draw) - $0.18/kWh</option>
                <option value="offpeak">Off-Peak Charging (Midnight - 06:00 AM) - $0.11/kWh</option>
              </select>
              <p className="text-[10px] text-slate-550">
                Off-peak charging avoids heavy demand surcharges, saving up to $28/month.
              </p>
            </div>
          </div>
        </div>

        {/* Calculated Results Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-6">Simulated Forecast Outputs</h3>
            
            <div className="space-y-6">
              {/* Output 1: Bill */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                <span className="text-[9px] font-bold font-mono text-slate-500 uppercase block">PROJECTED MONTHLY BILL</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">
                  ${projectedBill.toFixed(2)}
                </span>
                <p className="text-[9px] text-slate-500 mt-1">
                  Baseline $135 plus thermal adjustment minus ${solarCredit.toFixed(0)} solar credits
                </p>
              </div>

              {/* Output 2: Carbon footprint */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                <span className="text-[9px] font-bold font-mono text-slate-500 uppercase block">PROJECTED CARBON FOOTPRINT</span>
                <span className="text-2xl font-extrabold text-violet-400 mt-1 block">
                  {projectedCarbon.toFixed(1)} <span className="text-xs font-medium text-slate-500">kg CO₂/mo</span>
                </span>
                <p className="text-[9px] text-slate-500 mt-1">
                  Solar installation offsets {solarCarbonCredit.toFixed(0)} kg of carbon emission
                </p>
              </div>

              {/* Output 3: Grid Independence Gauge */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold font-mono text-slate-500 uppercase block">GRID INDEPENDENCE</span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                    {gridIndependence}%
                  </span>
                  <p className="text-[9px] text-slate-505 mt-1">
                    Solar offset vs household load
                  </p>
                </div>
                <div className="relative w-14 h-14 flex items-center justify-center font-mono text-[10px] font-bold text-slate-300">
                  <svg className="absolute w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#1e293b" strokeWidth="3" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3" 
                      strokeDasharray={`${gridIndependence}, 100`} 
                    />
                  </svg>
                  <span>{gridIndependence}%</span>
                </div>
              </div>

            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center font-mono">
            Values update instantaneously on change.
          </div>
        </div>

      </div>
    </div>
  );
}

export default WhatIfSimulator;

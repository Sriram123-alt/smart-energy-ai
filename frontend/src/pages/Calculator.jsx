import { useState } from "react";

export function Calculator() {
  // Appliances State
  const [appliances, setAppliances] = useState([
    { id: 1, name: "Air Conditioner / Heat Pump", category: "Cooling/Heating", wattage: 2000, quantity: 1, hours: 6 },
    { id: 2, name: "Smart Refrigerator", category: "Kitchen", wattage: 150, quantity: 1, hours: 24 },
    { id: 3, name: "Electric Vehicle Charger", category: "EV", wattage: 7200, quantity: 1, hours: 2 },
    { id: 4, name: "Lighting (LEDs & Plugs)", category: "Lighting", wattage: 100, quantity: 10, hours: 5 },
    { id: 5, name: "Washing Machine & Dryer", category: "Laundry", wattage: 1500, quantity: 1, hours: 1 },
    { id: 6, name: "TV & Entertainment Systems", category: "Electronics", wattage: 120, quantity: 2, hours: 4 },
  ]);

  // Tariff & Rate State
  const [tariffMode, setTariffMode] = useState("flat"); // flat, tou (Time-of-Use), green
  const [ratePerKwh, setRatePerKwh] = useState(0.15); // flat rate in $
  const [serviceFee, setServiceFee] = useState(12.00); // monthly service fee in $
  
  // Seasonal Variables for Monthly Prediction
  const [season, setSeason] = useState("summer"); // summer, winter, shoulder
  const [weatherIntensity, setWeatherIntensity] = useState("hot"); // hot, normal, mild

  // New Custom Appliance Form
  const [newAppliance, setNewAppliance] = useState({ name: "", wattage: 500, quantity: 1, hours: 2 });

  // Derived calculations computed dynamically on each render
  let baseDailyWh = 0;
  appliances.forEach((app) => {
    baseDailyWh += app.wattage * app.quantity * app.hours;
  });
  const dailyKwh = baseDailyWh / 1000;
  const weeklyKwh = dailyKwh * 7;
  const monthlyKwh = dailyKwh * 30.4; // Average days in month

  let multiplier = 1;
  if (tariffMode === "tou") {
    multiplier = 1.3;
  } else if (tariffMode === "green") {
    multiplier = 0.9;
  }
  
  const activeRate = ratePerKwh * multiplier;
  const dailyCost = dailyKwh * activeRate;
  const monthlyCost = (monthlyKwh * activeRate) + serviceFee;

  let seasonalFactor;
  if (season === "summer") {
    seasonalFactor = weatherIntensity === "hot" ? 1.45 : weatherIntensity === "mild" ? 0.95 : 1.2;
  } else if (season === "winter") {
    seasonalFactor = weatherIntensity === "cold" ? 1.35 : weatherIntensity === "mild" ? 0.90 : 1.15;
  } else { // shoulder
    seasonalFactor = 0.85;
  }

  const predictedMonthlyKwh = monthlyKwh * seasonalFactor;
  const predictedMonthlyCost = (predictedMonthlyKwh * activeRate) + serviceFee;


  // Adjust specific appliance row
  const updateAppliance = (id, field, value) => {
    setAppliances(
      appliances.map((app) => (app.id === id ? { ...app, [field]: value } : app))
    );
  };

  // Delete an appliance
  const removeAppliance = (id) => {
    setAppliances(appliances.filter((app) => app.id !== id));
  };

  // Add custom appliance
  const addAppliance = (e) => {
    e.preventDefault();
    if (!newAppliance.name.trim()) return;

    setAppliances([
      ...appliances,
      {
        id: Date.now(),
        name: newAppliance.name,
        category: "Custom",
        wattage: Number(newAppliance.wattage),
        quantity: Number(newAppliance.quantity),
        hours: Number(newAppliance.hours),
      },
    ]);
    setNewAppliance({ name: "", wattage: 500, quantity: 1, hours: 2 });
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Grid & Bill Estimator</h1>
        <p className="text-slate-400 text-xs mt-1">Interactive calculator to model consumption draws, utility tariff rates, and monthly projections.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Appliance Inventory (Consumption Calculator) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">1. Consumption Calculator</h3>
                <p className="text-xs text-slate-500">Configure connected household loads and run schedules</p>
              </div>
            </div>

            <div className="space-y-4">
              {appliances.map((app) => (
                <div 
                  key={app.id} 
                  className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-750 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white">{app.name}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded uppercase">{app.category}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500 font-mono">
                      <span>Rate: <input 
                        type="number"
                        value={app.wattage}
                        onChange={(e) => updateAppliance(app.id, "wattage", Math.max(0, Number(e.target.value)))}
                        className="w-14 bg-slate-900 border border-slate-850 px-1 py-0.5 text-center text-slate-350 rounded focus:outline-none focus:border-emerald-500 text-[10px]"
                      /> W</span>
                      <span>Qty: <input 
                        type="number"
                        value={app.quantity}
                        onChange={(e) => updateAppliance(app.id, "quantity", Math.max(1, Number(e.target.value)))}
                        className="w-10 bg-slate-900 border border-slate-850 px-1 py-0.5 text-center text-slate-350 rounded focus:outline-none focus:border-emerald-500 text-[10px]"
                      /></span>
                    </div>
                  </div>

                  {/* Slider & Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-1 w-36 sm:w-44">
                      <div className="flex justify-between text-[9px] font-semibold font-mono text-slate-500">
                        <span>DAILY USAGE</span>
                        <span className="text-emerald-400 font-bold">{app.hours} hrs</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="24"
                        value={app.hours}
                        onChange={(e) => updateAppliance(app.id, "hours", Number(e.target.value))}
                        className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                    <button 
                      onClick={() => removeAppliance(app.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 border border-slate-850 hover:border-rose-500/20 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Custom Appliance */}
            <form onSubmit={addAppliance} className="pt-4 border-t border-slate-800/60 flex flex-col md:flex-row gap-3">
              <input 
                type="text"
                placeholder="Appliance name (e.g. Smart Fan)"
                value={newAppliance.name}
                onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                required
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2 w-full md:w-auto">
                <input 
                  type="number"
                  placeholder="Watts"
                  value={newAppliance.wattage}
                  onChange={(e) => setNewAppliance({ ...newAppliance, wattage: e.target.value })}
                  required
                  className="w-20 px-2.5 py-2 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="number"
                  placeholder="Hrs"
                  value={newAppliance.hours}
                  onChange={(e) => setNewAppliance({ ...newAppliance, hours: e.target.value })}
                  required
                  className="w-16 px-2.5 py-2 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
                >
                  Add Custom
                </button>
              </div>
            </form>
          </div>

          {/* Rate & Tariff Settings (Bill Calculator Controller) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">2. Utility Tariff Model</h3>
              <p className="text-xs text-slate-500">Configure your electricity billing terms and grid rates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tariff Selectors */}
              {[
                { key: "flat", label: "Flat Grid Tariff", desc: "Constant rate per kWh" },
                { key: "tou", label: "Time-of-Use Rate", desc: "Adds peak demand surcharge (+30%)" },
                { key: "green", label: "Green Energy Rate", desc: "Solar/Eco credit savings (-10%)" }
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setTariffMode(m.key)}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    tariffMode === m.key
                      ? "bg-emerald-500/5 border-emerald-500/30 text-white"
                      : "bg-slate-950/20 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold">{m.label}</span>
                    {tariffMode === m.key && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{m.desc}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Flat Rate slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold font-mono text-slate-400">
                  <span>BASE ENERGY RATE</span>
                  <span className="text-emerald-400">${ratePerKwh.toFixed(2)}/kWh</span>
                </div>
                <input 
                  type="range"
                  min="0.08"
                  max="0.45"
                  step="0.01"
                  value={ratePerKwh}
                  onChange={(e) => setRatePerKwh(Number(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Service Fee input */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold font-mono text-slate-400">
                  <span>MONTHLY BASE SERVICE FEE</span>
                  <span className="text-emerald-400">${serviceFee.toFixed(2)}</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(Number(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Metrics & Predictions */}
        <div className="space-y-6">
          {/* Summary calculations (Energy consumption / basic bill) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <h3 className="text-sm font-semibold text-slate-200">Current Calculations</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Calculated Consumption</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">
                    {monthlyKwh.toFixed(1)} <span className="text-xs text-slate-500 font-mono">kWh/mo</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Daily / Weekly</span>
                  <span className="text-xs font-bold text-slate-300 font-mono mt-1 block">{dailyKwh.toFixed(1)} / {weeklyKwh.toFixed(1)} kWh</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Estimated Cost</span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                    ${monthlyCost.toFixed(2)} <span className="text-xs text-slate-500 font-mono">/mo</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Daily Cost / Base Fee</span>
                  <span className="text-xs font-bold text-slate-350 font-mono mt-1 block">${dailyCost.toFixed(2)} / ${serviceFee.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Consumption Prediction Widget */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-500/5 blur-[50px] pointer-events-none"></div>

            <div>
              <h3 className="text-sm font-semibold text-slate-200">3. Monthly Prediction Modeling</h3>
              <p className="text-xs text-slate-500">Weather-linked consumption predictions and billing trends</p>
            </div>

            {/* Weather & Season Variables */}
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">SEASON CLIMATE MODE</span>
                <div className="flex gap-2">
                  {[
                    { key: "summer", label: "☀️ Summer" },
                    { key: "winter", label: "❄️ Winter" },
                    { key: "shoulder", label: "🍂 Shoulder" }
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSeason(s.key)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase font-mono transition cursor-pointer border ${
                        season === s.key
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : "bg-slate-950/20 text-slate-500 border-slate-850 hover:text-slate-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {season !== "shoulder" && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">TEMPERATURE INTENSITY</span>
                  <div className="flex gap-2">
                    {[
                      { key: "mild", label: "Mild" },
                      { key: "normal", label: "Normal" },
                      { key: "hot", label: season === "summer" ? "Extremely Hot" : "Extremely Cold" }
                    ].map((w) => (
                      <button
                        key={w.key}
                        onClick={() => setWeatherIntensity(w.key)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase font-mono transition cursor-pointer border ${
                          weatherIntensity === w.key
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            : "bg-slate-950/20 text-slate-500 border-slate-850 hover:text-slate-400"
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Predictions Result */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Projected Monthly Load:</span>
                <span className="font-mono font-bold text-white">{predictedMonthlyKwh.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Projected Monthly Bill:</span>
                <span className="font-mono font-bold text-cyan-400">${predictedMonthlyCost.toFixed(2)}</span>
              </div>
              
              <div className="p-3.5 rounded-xl bg-cyan-950/10 border border-cyan-500/10">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">AI PREDICTION INSIGHT</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      {season === "summer" && weatherIntensity === "hot"
                        ? "Peak AC cooling load is projected. Setting thermostats to 78°F saves up to $22.50 monthly."
                        : season === "winter" && weatherIntensity === "hot"
                          ? "Heavy heat-pump usage predicted. Ensure smart scheduling to run during off-peak slots."
                          : "Moderate weather outlook. Solar generation offset efficiency is maximum. Low grid dependency."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Calculator;

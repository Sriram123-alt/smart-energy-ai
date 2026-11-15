import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function EnergyChart({ data }) {
  return (
    <div className="w-full h-80 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-300">24-Hour Energy Profile</h4>
        <p className="text-xs text-slate-500">Hourly consumption vs solar generation</p>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Area type="monotone" name="Consumption" dataKey="consumption" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCons)" />
            <Area type="monotone" name="Solar Gen" dataKey="solar" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSolar)" />
            <Area type="monotone" name="Grid Net" dataKey="grid" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorGrid)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EnergyChart;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md shadow-xl text-xs space-y-1">
        <p className="text-slate-400 font-bold font-mono border-b border-slate-800 pb-1 mb-1">{label}</p>
        <p className="text-indigo-400">Total Load: <span className="font-bold">{payload[0]?.value} kW</span></p>
        <p className="text-emerald-400">Solar Gen: <span className="font-bold">{payload[1]?.value} kW</span></p>
        <p className="text-cyan-405">Grid Net: <span className="font-bold">{payload[2]?.value} kW</span></p>
      </div>
    );
  }
  return null;
};


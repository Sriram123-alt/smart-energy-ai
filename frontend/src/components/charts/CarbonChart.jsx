import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function CarbonChart() {
  const data = [
    { day: "Mon", gridEmissions: 12.4, avoidedEmissions: 4.5 },
    { day: "Tue", gridEmissions: 10.8, avoidedEmissions: 5.1 },
    { day: "Wed", gridEmissions: 11.5, avoidedEmissions: 3.8 },
    { day: "Thu", gridEmissions: 13.1, avoidedEmissions: 2.5 },
    { day: "Fri", gridEmissions: 14.2, avoidedEmissions: 4.8 },
    { day: "Sat", gridEmissions: 15.6, avoidedEmissions: 6.2 },
    { day: "Sun", gridEmissions: 11.2, avoidedEmissions: 5.8 }
  ];

  return (
    <div className="w-full h-80 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-300">Carbon Footprint Analysis</h4>
        <p className="text-xs text-slate-500">Weekly greenhouse gas savings from renewable offsets</p>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGridEm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#475569" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAvoided" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
            <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Area type="monotone" name="Grid Footprint (kg)" dataKey="gridEmissions" stroke="#64748b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorGridEm)" />
            <Area type="monotone" name="Carbon Avoided (kg)" dataKey="avoidedEmissions" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAvoided)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CarbonChart;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md shadow-xl text-xs space-y-1">
        <p className="text-slate-400 font-bold font-mono border-b border-slate-800 pb-1 mb-1">{payload[0]?.payload.day}</p>
        <p className="text-violet-400">Carbon Avoided: <span className="font-bold">{payload[1]?.value} kg</span></p>
        <p className="text-slate-400">Grid Footprint: <span className="font-bold">{payload[0]?.value} kg</span></p>
      </div>
    );
  }
  return null;
};


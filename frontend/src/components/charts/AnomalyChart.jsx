import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function AnomalyChart() {
  // Mock data representing a daily hourly profile with a prominent night-time anomaly
  const data = [
    { hour: "00:00", load: 0.8, baseline: 0.8, isAnomaly: false },
    { hour: "02:00", load: 2.2, baseline: 0.7, isAnomaly: true }, // The AC anomaly
    { hour: "04:00", load: 2.0, baseline: 0.6, isAnomaly: true }, // The AC anomaly
    { hour: "06:00", load: 0.9, baseline: 0.8, isAnomaly: false },
    { hour: "08:00", load: 1.4, baseline: 1.2, isAnomaly: false },
    { hour: "10:00", load: 1.1, baseline: 1.0, isAnomaly: false },
    { hour: "12:00", load: 0.7, baseline: 0.9, isAnomaly: false },
    { hour: "14:00", load: 0.8, baseline: 1.1, isAnomaly: false },
    { hour: "16:00", load: 1.5, baseline: 1.4, isAnomaly: false },
    { hour: "18:00", load: 2.9, baseline: 2.8, isAnomaly: false },
    { hour: "20:00", load: 2.6, baseline: 2.4, isAnomaly: false },
    { hour: "22:00", load: 1.1, baseline: 1.2, isAnomaly: false }
  ];

  return (
    <div className="w-full h-80 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-300">Spike Analysis (24h Window)</h4>
        <p className="text-xs text-slate-500">Comparing active load draw against safety baselines</p>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
            <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Bar name="Actual Load" dataKey="load">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isAnomaly ? "#f43f5e" : "#6366f1"} 
                  fillOpacity={0.7}
                />
              ))}
            </Bar>
            <Bar name="Baseline Threshold" dataKey="baseline" fill="#334155" fillOpacity={0.4} stroke="#475569" strokeDasharray="4 4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnomalyChart;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md shadow-xl text-xs space-y-1">
        <p className="text-slate-400 font-bold font-mono border-b border-slate-800 pb-1 mb-1">{dataPoint.hour}</p>
        <p className="text-slate-300">Baseline Load: <span className="font-bold">{dataPoint.baseline} kW</span></p>
        <p className={dataPoint.isAnomaly ? "text-rose-400 font-bold" : "text-indigo-400"}>
          Actual Load: <span className="font-bold">{dataPoint.load} kW</span>
        </p>
        {dataPoint.isAnomaly && (
          <p className="text-[10px] text-rose-300 bg-rose-950/40 px-1 py-0.5 rounded mt-1 font-semibold text-center animate-pulse">
            ANOMALY TRIGGERED
          </p>
        )}
      </div>
    );
  }
  return null;
};


import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function CostChart({ data }) {
  return (
    <div className="w-full h-80 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-300">Monthly Utility Cost Breakdown</h4>
        <p className="text-xs text-slate-500">Historical look at grid fees versus solar solar offset credits</p>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Bar name="Grid Cost ($)" dataKey="gridCost" fill="#f59e0b" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            <Bar name="Solar Credits ($)" dataKey="solarOffset" fill="#10b981" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            <Bar name="Taxes & Fees ($)" dataKey="taxes" fill="#64748b" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CostChart;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const p = payload[0].payload;
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md shadow-xl text-xs space-y-1">
        <p className="text-slate-400 font-bold font-mono border-b border-slate-800 pb-1 mb-1">{p.month}</p>
        <p className="text-amber-400">Grid Charges: <span className="font-bold">${p.gridCost}</span></p>
        <p className="text-emerald-400">Solar Credits: <span className="font-bold">-${p.solarOffset}</span></p>
        <p className="text-slate-400">Taxes & Fees: <span className="font-bold">${p.taxes}</span></p>
        <p className="text-white font-bold border-t border-slate-800 pt-1 mt-1">
          Total Bill: <span>${p.total}</span>
        </p>
      </div>
    );
  }
  return null;
};


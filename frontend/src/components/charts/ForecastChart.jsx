import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function ForecastChart({ data }) {
  return (
    <div className="w-full h-80 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-300">7-Day Load Forecast</h4>
        <p className="text-xs text-slate-500">Weather-influenced demand forecasting with confidence band</p>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
            <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            
            {/* Shaded Confidence Interval */}
            <Area 
              name="Confidence Range" 
              dataKey="upperBound" 
              stroke="none" 
              fill="#06b6d4" 
              fillOpacity={0.08}
            />
            {/* The actual lower line is just to offset if needed, but in ComposedChart area fills from baseline 0.
                To create a band, Recharts lets us pass an array to dataKey for area range. */}
            <Area 
              name="Range Band"
              dataKey="upperBound" 
              baseValue="lowerBound" 
              stroke="none" 
              fill="#06b6d4" 
              fillOpacity={0.12} 
            />

            <Line 
              type="monotone" 
              name="Net Grid Draw (kWh)" 
              dataKey="gridNet" 
              stroke="#06b6d4" 
              strokeWidth={3} 
              dot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              name="Solar generation (kWh)" 
              dataKey="predictedSolar" 
              stroke="#10b981" 
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ForecastChart;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const p = payload[0].payload;
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md shadow-xl text-xs space-y-1">
        <p className="text-slate-400 font-bold font-mono border-b border-slate-800 pb-1 mb-1">{p.day}</p>
        <p className="text-cyan-400 font-bold">Predicted Grid Net: <span>{p.gridNet} kWh</span></p>
        <p className="text-slate-400">Total Load Estimate: <span>{p.predictedUsage} kWh</span></p>
        <p className="text-emerald-400">Solar Gen Estimate: <span>{p.predictedSolar} kWh</span></p>
        <p className="text-[10px] text-slate-505 font-mono mt-1">
          Range: {p.lowerBound} - {p.upperBound} kWh
        </p>
      </div>
    );
  }
  return null;
};


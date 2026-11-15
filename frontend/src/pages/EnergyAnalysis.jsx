import { useState, useEffect, useMemo } from "react";
import { energyService } from "../services/energyService";
import { applianceService } from "../services/applianceService";
import { Loader } from "../components/common/Loader";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ─────────────────────────── helpers ────────────────────────────
const PERIODS = ["Today", "This Week", "This Month", "Last 6 Months"];

function buildWeeklyData(curve) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => {
    const factor = [0.9, 0.95, 1.0, 1.05, 1.1, 1.3, 1.25][i];
    const consumption = parseFloat((curve.reduce((s, h) => s + h.consumption, 0) * factor * 0.08).toFixed(2));
    const solar = parseFloat((curve.reduce((s, h) => s + h.solar, 0) * factor * 0.08).toFixed(2));
    const grid = parseFloat(Math.max(0, consumption - solar).toFixed(2));
    return { time: day, consumption, solar, grid };
  });
}

function buildMonthlyData(bills) {
  return bills.map((b) => ({
    time: b.month,
    consumption: parseFloat((b.total / 0.15).toFixed(1)),
    solar: parseFloat((b.solarOffset / 0.15).toFixed(1)),
    grid: parseFloat(((b.total - b.solarOffset) / 0.15).toFixed(1)),
  }));
}

function build6MonthData(bills) {
  return bills.map((b) => ({
    time: b.month,
    consumption: parseFloat((b.total / 0.15).toFixed(1)),
    solar: parseFloat((b.solarOffset / 0.15).toFixed(1)),
    grid: parseFloat(((b.total - b.solarOffset) / 0.15).toFixed(1)),
  }));
}

const PIE_COLORS = ["#6366f1", "#10b981", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6"];

// ─────────────────────────── Tooltip ────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
      <p className="text-slate-400 font-bold font-mono border-b border-slate-800 pb-1 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value} kWh</span>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const name = entry?.name ?? "";
  const value = entry?.value ?? 0;
  const pct = entry?.payload?.pct ?? "0";
  return (
    <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-xl text-xs">
      <p className="font-bold text-slate-200">{name}</p>
      <p className="text-slate-400">{value} W · <span className="text-emerald-400 font-bold">{pct}%</span></p>
    </div>
  );
};

// ─────────────────────────── Stat Card ──────────────────────────
function StatCard({ label, value, unit, sub, color = "text-white", badge }) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between gap-2">
      <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline space-x-1.5">
        <span className={`text-3xl font-extrabold ${color}`}>{value}</span>
        <span className="text-xs text-slate-500 font-mono">{unit}</span>
      </div>
      {sub && <span className="text-[10px] text-slate-500">{sub}</span>}
      {badge && (
        <span className={`self-start text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>
          {badge.text}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────── Main Page ──────────────────────────
export function EnergyAnalysis() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("Today");
  const [todayData, setTodayData] = useState(null);
  const [loadCurve, setLoadCurve] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [appliances, setAppliances] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [summary, curve, bills, devices] = await Promise.all([
          energyService.getTodaySummary(),
          energyService.getHourlyLoadCurve(),
          energyService.getMonthlyBillHistory(),
          applianceService.getAppliances(),
        ]);
        setTodayData(summary);
        setLoadCurve(curve);
        setBillHistory(bills);
        setAppliances(devices);
      } catch (e) {
        console.error("EnergyAnalysis: data fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── derived chart data ──
  const chartData = useMemo(() => {
    if (period === "Today") return loadCurve;
    if (period === "This Week") return buildWeeklyData(loadCurve);
    if (period === "This Month") return buildMonthlyData(billHistory);
    return build6MonthData(billHistory);
  }, [period, loadCurve, billHistory]);

  // ── appliance breakdown pie ──
  const pieData = useMemo(() => {
    const active = appliances.filter((a) => a.status && a.id !== "app_solar");
    const total = active.reduce((s, a) => s + a.consumption, 0) || 1;
    return active.map((a) => ({
      name: a.name,
      value: a.consumption,
      pct: ((a.consumption / total) * 100).toFixed(1),
    }));
  }, [appliances]);

  // ── hourly heatmap (24 slots) ──
  const heatmap = useMemo(() => {
    return loadCurve.map((h) => {
      const pct = Math.min(1, h.consumption / 4.5);
      return { time: h.time, pct };
    });
  }, [loadCurve]);

  // ── top consumers ──
  const topConsumers = useMemo(() => {
    return [...appliances]
      .filter((a) => a.status && a.id !== "app_solar")
      .sort((a, b) => b.consumption - a.consumption)
      .slice(0, 5);
  }, [appliances]);

  // ── summary stats ──
  const totalToday = loadCurve.reduce((s, h) => s + h.consumption, 0);
  const solarToday = loadCurve.reduce((s, h) => s + h.solar, 0);
  const gridToday = loadCurve.reduce((s, h) => s + Math.max(0, h.grid), 0);
  const selfSufficiency = solarToday > 0 ? Math.min(100, (solarToday / totalToday) * 100) : 0;
  const peakHour = loadCurve.reduce((m, h) => (h.consumption > (m?.consumption ?? 0) ? h : m), null);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Energy Consumption Analysis</h1>
          <p className="text-slate-400 text-xs mt-1">Deep-dive breakdown of household load, solar offset & grid dependency</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center bg-slate-900/70 border border-slate-800 rounded-xl p-1 gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                period === p
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Consumption"
          value={totalToday.toFixed(1)}
          unit="kWh"
          sub="Gross household draw"
          color="text-indigo-400"
        />
        <StatCard
          label="Solar Generated"
          value={solarToday.toFixed(1)}
          unit="kWh"
          sub="Photovoltaic output"
          color="text-emerald-400"
        />
        <StatCard
          label="Grid Import"
          value={gridToday.toFixed(1)}
          unit="kWh"
          sub="Net draw from utility"
          color="text-cyan-400"
        />
        <StatCard
          label="Self-Sufficiency"
          value={selfSufficiency.toFixed(0)}
          unit="%"
          sub="Solar coverage ratio"
          color={selfSufficiency >= 50 ? "text-emerald-400" : "text-amber-400"}
          badge={
            selfSufficiency >= 50
              ? { text: "✓ SOLAR POSITIVE", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20" }
              : { text: "⚡ GRID DEPENDENT", cls: "text-amber-400 border-amber-500/30 bg-amber-950/20" }
          }
        />
        <StatCard
          label="Peak Hour"
          value={peakHour?.time ?? "—"}
          unit=""
          sub={peakHour ? `${peakHour.consumption} kW peak load` : "No data"}
          color="text-rose-400"
        />
      </div>

      {/* ── Main Area Chart ── */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-300">Consumption vs Solar vs Grid — {period}</h4>
          <p className="text-xs text-slate-500">Stacked energy profile with solar offset and grid net draw</p>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gCons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit=" kWh" />
              <Tooltip content={<ChartTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
              <Area type="monotone" name="Consumption" dataKey="consumption" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#gCons)" />
              <Area type="monotone" name="Solar Gen" dataKey="solar" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gSolar)" />
              <Area type="monotone" name="Grid Import" dataKey="grid" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#gGrid)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Mid Row: Hourly Heatmap + Appliance Pie ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Hourly Load Heatmap */}
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-300">24-Hour Load Intensity Heatmap</h4>
            <p className="text-xs text-slate-500">Colour intensity = relative consumption load per hour</p>
          </div>
          <div className="grid grid-cols-12 gap-1.5">
            {heatmap.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-md"
                  style={{
                    height: "36px",
                    background: `rgba(99,102,241,${0.08 + h.pct * 0.85})`,
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                  title={`${h.time}: ${loadCurve[i]?.consumption ?? 0} kW`}
                />
                <span className="text-[8px] text-slate-500 font-mono">{h.time.slice(0, 2)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-0.5">
              {[0.08, 0.3, 0.5, 0.7, 0.93].map((o) => (
                <div
                  key={o}
                  className="w-6 h-3 rounded-sm"
                  style={{ background: `rgba(99,102,241,${o})` }}
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-500 font-mono">LOW → HIGH</span>
          </div>
        </div>

        {/* Appliance Pie */}
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-300">Active Load Distribution</h4>
            <p className="text-xs text-slate-500">Share of live consumption by appliance</p>
          </div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
              No active appliances detected
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-48 h-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-xs text-slate-300 truncate flex-1">{d.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Bar Chart + Top Consumers ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar Chart: daily breakdown */}
        <div className="xl:col-span-2 p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-300">Consumption Breakdown — {period}</h4>
            <p className="text-xs text-slate-500">Grouped bars: total load, solar offset, and net grid draw</p>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit=" kWh" />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={32} iconType="square" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                <Bar name="Consumption" dataKey="consumption" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar name="Solar Gen" dataKey="solar" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar name="Grid Import" dataKey="grid" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Consumers */}
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-300">Top Energy Consumers</h4>
            <p className="text-xs text-slate-500">Currently active devices ranked by draw</p>
          </div>
          <div className="space-y-3">
            {topConsumers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No active devices</p>
            ) : (
              topConsumers.map((app, idx) => {
                const totalW = topConsumers.reduce((s, a) => s + a.consumption, 0) || 1;
                const pct = ((app.consumption / totalW) * 100).toFixed(0);
                const bar_colors = ["#6366f1", "#10b981", "#06b6d4", "#f59e0b", "#ec4899"];
                return (
                  <div key={app.id} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500 w-4">{idx + 1}</span>
                        <span className="text-xs font-medium text-slate-200 truncate max-w-[130px]">{app.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300 font-bold">{app.consumption}W</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: bar_colors[idx % bar_colors.length] }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Efficiency tip */}
          {topConsumers.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
              <p className="text-[10px] text-amber-400 font-semibold">⚡ AI TIP</p>
              <p className="text-[10px] text-slate-400 mt-1">
                <span className="text-slate-200 font-medium">{topConsumers[0]?.name}</span> is your top draw. Consider scheduling it during your peak solar window (10 AM – 2 PM) to maximise self-sufficiency.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnergyAnalysis;


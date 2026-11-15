import { useState, useEffect } from "react";
import { reportService } from "../services/reportService";
import { Loader } from "../components/common/Loader";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-31");
  const [format, setFormat] = useState("PDF");
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await reportService.getReportData(startDate, endDate);
      setTimeout(() => {
        setStats(data);
        setLoading(false);
      }, 0);
    };
    fetchStats();
  }, [startDate, endDate]);

  const handleDownload = async () => {
    setExporting(true);
    try {
      const res = await reportService.downloadReport(format, startDate, endDate);
      setToast({
        type: "success",
        text: `Report generated successfully: ${res.fileName}`
      });
      // Auto-hide toast after 4 seconds
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      console.error("Report download failed", e);
      setToast({
        type: "error",
        text: "Failed to download energy report. Please retry."
      });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19] relative">
      {/* Toast notifications */}
      {toast && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl border z-50 text-xs font-semibold flex items-center gap-3 animate-slideIn ${
          toast.type === "success" 
            ? "bg-slate-900 border-emerald-500/30 text-emerald-400 shadow-xl" 
            : "bg-slate-900 border-rose-500/30 text-rose-400 shadow-xl"
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-400" : "bg-rose-400"}`} />
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:text-white transition cursor-pointer">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Custom Reports</h1>
        <p className="text-slate-400 text-xs mt-1">Export structured diagnostics summaries of historical energy, offsets, and billing metrics</p>
      </div>

      {/* Configuration Widget */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col md:flex-row items-end gap-5">
        <div className="w-full md:flex-1 space-y-1.5">
          <label className="text-[10px] tracking-wider font-bold text-slate-400 uppercase font-mono">Start Date</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 transition font-semibold"
          />
        </div>

        <div className="w-full md:flex-1 space-y-1.5">
          <label className="text-[10px] tracking-wider font-bold text-slate-400 uppercase font-mono">End Date</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 transition font-semibold"
          />
        </div>

        <div className="w-full md:w-36 space-y-1.5">
          <label className="text-[10px] tracking-wider font-bold text-slate-400 uppercase font-mono">File Format</label>
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 transition font-semibold cursor-pointer"
          >
            <option>PDF</option>
            <option>CSV</option>
          </select>
        </div>

        <button
          onClick={handleDownload}
          disabled={exporting || loading}
          className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-55"
        >
          {exporting ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export {format}</span>
            </>
          )}
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        stats && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Visual breakdown metrics */}
            <div className="xl:col-span-2 p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-300">Report Summary Details</h4>
                <p className="text-xs text-slate-500">Overview metrics gathered for the selected range</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/45 border border-slate-900 font-mono">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">TOTAL CONSUMPTION</span>
                  <span className="text-lg font-bold text-slate-200 mt-1 block">{stats.totalUsageKWh} kWh</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/45 border border-slate-900 font-mono">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">SOLAR PRODUCTION</span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 block">{stats.totalSolarKWh} kWh</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/45 border border-slate-900 font-mono">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">NET UTILITY INTAKE</span>
                  <span className="text-lg font-bold text-cyan-400 mt-1 block">{stats.netGridKWh} kWh</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/45 border border-slate-900 font-mono">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">CARBON MITIGATED</span>
                  <span className="text-lg font-bold text-violet-400 mt-1 block">{stats.avoidedCarbonKg} kg CO₂</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/45 border border-slate-900 font-mono col-span-2 md:col-span-1">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">BILL SUM CHARGES</span>
                  <span className="text-lg font-bold text-white mt-1 block">${stats.totalBillPaid.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Pie Chart breakdown */}
            <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-1">Consumption Share</h4>
                <p className="text-xs text-slate-500 mb-4">Percentage breakdown by category load</p>
              </div>

              <div className="w-full h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={stats.applianceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.applianceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                  <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Top load</span>
                  <span className="text-xs text-white font-bold font-mono">Cooling (45%)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[10px] text-slate-400 font-mono">
                {stats.applianceBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <span style={{ backgroundColor: COLORS[idx % COLORS.length] }} className="w-2.5 h-2.5 rounded-sm shrink-0" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )
      )}
    </div>
  );
}

export default Reports;

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[11px] backdrop-blur shadow">
        <p className="text-slate-300 font-bold">{payload[0].name}</p>
        <p className="text-indigo-400 font-mono mt-0.5">Share: <span className="font-bold">{payload[0].value}%</span></p>
      </div>
    );
  }
  return null;
};


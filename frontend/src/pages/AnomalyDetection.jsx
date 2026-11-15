import { useState, useEffect } from "react";
import { anomalyService } from "../services/anomalyService";
import { AnomalyChart } from "../components/charts/AnomalyChart";
import { Loader } from "../components/common/Loader";

export function AnomalyDetection() {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [filter, setFilter] = useState("all");

  // Email Notification States (Nice-to-Have: Email Alerts)
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(() => {
    return localStorage.getItem("email_alerts_enabled") === "true";
  });
  const [emailAddress, setEmailAddress] = useState(() => {
    return localStorage.getItem("email_alerts_address") || "alerts@smartenergy.com";
  });
  const [alertFrequency, setAlertFrequency] = useState(() => {
    return localStorage.getItem("email_alerts_frequency") || "instant";
  });
  const [subscribedCategories, setSubscribedCategories] = useState(() => {
    const saved = localStorage.getItem("email_alerts_subs");
    return saved ? JSON.parse(saved) : ["critical", "warnings"];
  });
  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("email_alerts_enabled", emailAlertsEnabled);
    localStorage.setItem("email_alerts_address", emailAddress);
    localStorage.setItem("email_alerts_frequency", alertFrequency);
    localStorage.setItem("email_alerts_subs", JSON.stringify(subscribedCategories));
  }, [emailAlertsEnabled, emailAddress, alertFrequency, subscribedCategories]);

  const handleSendTestAlert = async () => {
    setTestLoading(true);
    setTestMessage("");
    try {
      await anomalyService.sendTestEmail(emailAddress);
      setTestLoading(false);
      setTestMessage(`Test alert email successfully dispatched to ${emailAddress}!`);
      setTimeout(() => setTestMessage(""), 5000);
    } catch (e) {
      setTestLoading(false);
      setTestMessage("Failed to send test alert email.");
      setTimeout(() => setTestMessage(""), 5000);
    }
  };

  useEffect(() => {
    const loadAnomalies = async () => {
      const data = await anomalyService.getAnomalies();
      setTimeout(() => {
        setAnomalies(data);
        setLoading(false);
      }, 0);
    };
    loadAnomalies();
  }, []);

  const [triggering, setTriggering] = useState(false);

  const handleResolve = async (id) => {
    const updated = await anomalyService.resolveAnomaly(id);
    setAnomalies(updated);
  };

  const handleTriggerIncident = async () => {
    setTriggering(true);
    try {
      const updated = await anomalyService.triggerIncident();
      setAnomalies(updated);
    } finally {
      setTriggering(false);
    }
  };

  const filteredAnomalies = anomalies.filter(anom => {
    if (filter === "all") return true;
    if (filter === "resolved") return anom.resolved;
    if (filter === "active") return !anom.resolved;
    return anom.severity === filter && !anom.resolved;
  });

  const activeCount = anomalies.filter(a => !a.resolved).length;
  const criticalCount = anomalies.filter(a => a.severity === "critical" && !a.resolved).length;
  
  // Total daily cost impact of active anomalies
  const totalCostImpact = anomalies
    .filter(a => !a.resolved)
    .reduce((sum, a) => sum + a.impactCost, 0);

  if (loading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Anomaly Detection Hub</h1>
        <p className="text-slate-400 text-xs mt-1">AI monitors load curves for leaks, phantom draw, and scheduling misfits</p>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">ACTIVE INCIDENTS</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{activeCount}</span>
            <span className="text-xs text-slate-500 font-mono">active / {anomalies.length} total</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 block">Continuous sensor polling active</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-rose-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-rose-400 font-bold font-mono uppercase">CRITICAL INCIDENTS</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-rose-500">{criticalCount}</span>
            <span className="text-xs text-rose-400/50 font-mono">needs response</span>
          </div>
          <span className="text-[10px] text-rose-400/80 mt-3 block font-semibold animate-pulse">
            {criticalCount > 0 ? "High priority overload detected" : "All safety gates operational"}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-amber-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-amber-400 font-bold font-mono uppercase">COST IMPACT IN PROGRESS</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-500">${totalCostImpact.toFixed(2)}</span>
            <span className="text-xs text-slate-500 font-mono">daily leak rate</span>
          </div>
          <span className="text-[10px] text-amber-400 mt-3 block">Resolving items cuts projection bills</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full">
        <AnomalyChart />
      </div>

      {/* Anomalies List with filters */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-800/60 pb-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Telemetry Alert Log</h3>
            <p className="text-xs text-slate-500">Filters incident lists using flags</p>
          </div>

          {/* Filter pills and trigger action */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerIncident}
              disabled={triggering}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase font-mono tracking-wider transition cursor-pointer bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 flex items-center space-x-1.5 disabled:opacity-50 mr-2"
              title="Spawn a new active incident"
            >
              <span className="text-amber-400">⚡</span>
              <span>{triggering ? "Spawning..." : "+ Active Incident"}</span>
            </button>

            {["all", "active", "critical", "warning", "resolved"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase font-mono tracking-wider transition cursor-pointer border ${
                  filter === tab
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-slate-950/20 text-slate-500 border-slate-850 hover:text-slate-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredAnomalies.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No anomalies found matching the selected filter.
            </div>
          ) : (
            filteredAnomalies.map((anom) => (
              <div 
                key={anom.id} 
                className={`p-5 rounded-2xl border transition relative ${
                  anom.resolved 
                    ? "bg-slate-950/10 border-slate-900 text-slate-500" 
                    : anom.severity === "critical"
                      ? "bg-slate-950/30 border-rose-500/15"
                      : "bg-slate-950/30 border-amber-500/15"
                }`}
              >
                {/* Meta details header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-extrabold ${
                      anom.resolved
                        ? "bg-slate-800 text-slate-500"
                        : anom.severity === "critical"
                          ? "bg-rose-950/40 text-rose-400"
                          : "bg-amber-950/40 text-amber-400"
                    }`}>
                      {anom.resolved ? "Resolved" : anom.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-300 font-sans">{anom.appliance}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{anom.timestamp}</span>
                </div>

                <h4 className={`text-sm font-semibold mb-2 ${anom.resolved ? 'text-slate-500' : 'text-slate-200'}`}>
                  {anom.title}
                </h4>
                <p className={`text-xs leading-relaxed max-w-3xl mb-4 ${anom.resolved ? 'text-slate-650' : 'text-slate-400'}`}>
                  {anom.description}
                </p>

                {/* Footer action fields */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-slate-900">
                  <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-500">
                    {anom.impactCost > 0 && (
                      <span>Waste Cost: <strong className={anom.resolved ? 'text-slate-500' : 'text-amber-500 font-bold'}>${anom.impactCost.toFixed(2)}/day</strong></span>
                    )}
                    {anom.impactCarbon > 0 && (
                      <span>CO₂ Waste: <strong className={anom.resolved ? 'text-slate-500' : 'text-violet-500 font-bold'}>{anom.impactCarbon} kg</strong></span>
                    )}
                  </div>

                  {!anom.resolved && (
                    <button
                      onClick={() => handleResolve(anom.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:border-slate-700 transition cursor-pointer"
                    >
                      Acknowledge & Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Alerts Settings Notification Center (Nice-to-Have: Email alerts) */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Email Alerts Notification Center</h3>
          <p className="text-xs text-slate-500">Configure real-time automated email notifications for detected anomalies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Controls Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-white block">Enable Automated Alerts</span>
                <span className="text-[10px] text-slate-500 block">Dispatch instant email alerts when critical anomalies occur</span>
              </div>
              <button 
                onClick={() => setEmailAlertsEnabled(!emailAlertsEnabled)}
                className={`w-10 h-6 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                  emailAlertsEnabled ? "bg-emerald-500" : "bg-slate-850"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                  emailAlertsEnabled ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-wider font-bold text-slate-400 uppercase font-mono">
                Recipient Email Address
              </label>
              <input
                type="email"
                disabled={!emailAlertsEnabled}
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="alerts@smartenergy.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-850 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 disabled:opacity-50 text-xs transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] tracking-wider font-bold text-slate-400 uppercase font-mono block">
                Alert Frequency
              </label>
              <div className="flex gap-2">
                {["instant", "digest", "weekly"].map((freq) => (
                  <button
                    key={freq}
                    disabled={!emailAlertsEnabled}
                    onClick={() => setAlertFrequency(freq)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase font-mono transition cursor-pointer border disabled:opacity-50 ${
                      alertFrequency === freq
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-950/20 text-slate-500 border-slate-850 hover:text-slate-400"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subscriptions Checkbox & Test dispatch */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] tracking-wider font-bold text-slate-400 uppercase font-mono block">
                Subscribe to Notifications
              </span>
              {[
                { key: "critical", label: "Critical load limit overdraws" },
                { key: "warnings", label: "Warning anomaly alerts (leaks, standby draws)" },
                { key: "faults", label: "Solar grid inverter faults & connection drops" }
              ].map((sub) => (
                <label key={sub.key} className="flex items-center space-x-3 text-xs text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!emailAlertsEnabled}
                    checked={subscribedCategories.includes(sub.key)}
                    onChange={() => {
                      if (subscribedCategories.includes(sub.key)) {
                        setSubscribedCategories(subscribedCategories.filter(c => c !== sub.key));
                      } else {
                        setSubscribedCategories([...subscribedCategories, sub.key]);
                      }
                    }}
                    className="rounded bg-slate-950 border-slate-850 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer disabled:opacity-50"
                  />
                  <span>{sub.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={!emailAlertsEnabled || testLoading || !emailAddress.includes("@")}
                onClick={handleSendTestAlert}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition disabled:opacity-40 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {testLoading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                ) : (
                  <span>Send Simulated Test Email Alert</span>
                )}
              </button>
              {testMessage && (
                <p className="text-[10px] text-emerald-400 text-center mt-2 font-mono font-medium animate-pulse">
                  {testMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnomalyDetection;

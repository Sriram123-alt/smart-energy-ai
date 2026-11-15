import apiClient from "./apiClient";

const INITIAL_ANOMALIES = [
  { id: "anom_1", severity: "critical", appliance: "Smart Air Conditioner", title: "Overnight Thermostat Mismatch", description: "Air Conditioner drew a continuous 2.2 kW load between 2:00 AM and 4:30 AM while outdoors was 65°F. Suggested cause: Open window or faulty sensor.", timestamp: "Today, 02:14 AM", resolved: false, impactCost: 4.80, impactCarbon: 12.5 },
  { id: "anom_2", severity: "warning", appliance: "Smart Refrigerator", title: "Compressor Cycle Prolonged", description: "Refrigerator compressor is cycle-running 80% of the time (typical is 30-50%). Indicates poor ventilation, door seal leakage, or dust on coils.", timestamp: "Yesterday, 04:45 PM", resolved: false, impactCost: 1.25, impactCarbon: 3.2 },
  { id: "anom_3", severity: "warning", appliance: "Tesla EV Charger", title: "Peak Hour EV Charging Detect", description: "EV Charger activated at 6:30 PM (Peak Price Period, $0.32/kWh) instead of scheduled midnight off-peak ($0.11/kWh).", timestamp: "2 days ago, 06:30 PM", resolved: true, impactCost: 8.50, impactCarbon: 0 },
  { id: "anom_4", severity: "info", appliance: "Smart Water Heater", title: "High Standby Loss", description: "Water Heater standby energy consumption increased by 20% over the last week. Consider wrapping the heater with an insulating jacket.", timestamp: "4 days ago, 09:00 AM", resolved: false, impactCost: 0.90, impactCarbon: 2.1 }
];

const STORAGE_KEY = "energy_anomalies";

const getStoredAnomalies = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANOMALIES));
    return INITIAL_ANOMALIES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ANOMALIES;
  }
};

const saveStoredAnomalies = (anomalies) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(anomalies));
};

export const anomalyService = {
  getAnomalies: async () => {
    try {
      const res = await apiClient.get("/anomalies");
      return res.data.map(anom => ({
        id: anom.id,
        severity: anom.severity,
        appliance: anom.appliance,
        title: anom.title,
        description: anom.description,
        timestamp: anom.timestamp,
        resolved: anom.resolved === 1,
        impactCost: anom.impact_cost,
        impactCarbon: anom.impact_carbon
      }));
    } catch (e) {
      console.warn("Backend anomalies API unavailable, using local mock", e);
      return getStoredAnomalies();
    }
  },

  resolveAnomaly: async (id) => {
    try {
      await apiClient.post(`/anomalies/${id}/resolve`);
      return await anomalyService.getAnomalies();
    } catch (e) {
      console.warn("Backend resolve API unavailable, resolving locally", e);
      const list = getStoredAnomalies();
      const updated = list.map((anom) => 
        anom.id === id ? { ...anom, resolved: true } : anom
      );
      saveStoredAnomalies(updated);
      return updated;
    }
  },

  sendTestEmail: async (email) => {
    try {
      const res = await apiClient.post("/anomalies/test-email", { email });
      return res.data;
    } catch (e) {
      console.warn("Backend test email API unavailable, mock dispatching", e);
      return { success: true, mocked: true };
    }
  },

  triggerIncident: async (customData = null) => {
    try {
      await apiClient.post("/anomalies/trigger", customData || {});
      return await anomalyService.getAnomalies();
    } catch (e) {
      console.warn("Backend trigger API unavailable, generating local active incident", e);
      const list = getStoredAnomalies();
      const newInc = {
        id: "anom_" + Math.random().toString(36).substr(2, 8),
        severity: "critical",
        appliance: customData?.appliance || "Central Air Conditioner",
        title: customData?.title || "Continuous Compressor Duty Cycle",
        description: customData?.description || "HVAC compressor drawing sustained 3.8 kW during mild ambient temperatures. Suspected refrigerant leak or stuck contactor.",
        timestamp: "Just now",
        resolved: false,
        impactCost: 4.60,
        impactCarbon: 1.95
      };
      const updated = [newInc, ...list];
      saveStoredAnomalies(updated);
      return updated;
    }
  },

  spawnLoginIncidentsLocally: () => {
    const list = getStoredAnomalies();
    const newInc1 = {
      id: "anom_" + Math.random().toString(36).substr(2, 8),
      severity: "critical",
      appliance: "Central Air Conditioner",
      title: "Active Surge Anomaly (User Session)",
      description: "Continuous 3.8 kW load detected on primary cooling branch right after login. Requires immediate HVAC verification.",
      timestamp: "Just now",
      resolved: false,
      impactCost: 4.60,
      impactCarbon: 1.95
    };
    const newInc2 = {
      id: "anom_" + Math.random().toString(36).substr(2, 8),
      severity: "warning",
      appliance: "Electric Vehicle Charger",
      title: "Off-Schedule Fast Charge Anomaly",
      description: "Level 2 EV charger pulling 7.2 kW during tier-3 peak tariff window instead of scheduled midnight slot.",
      timestamp: "Just now",
      resolved: false,
      impactCost: 3.85,
      impactCarbon: 1.60
    };
    saveStoredAnomalies([newInc1, newInc2, ...list]);
  },

  getActiveCount: () => {
    const list = getStoredAnomalies();
    return list.filter(anom => !anom.resolved).length;
  }
};
export default anomalyService;

import apiClient from "./apiClient";

const getSimulatorSettings = () => {
  const defaults = { thermostat: 72, solarInstalled: 4, evSchedule: "offpeak" };
  const stored = localStorage.getItem("energy_simulator");
  if (!stored) return defaults;
  try {
    return JSON.parse(stored);
  } catch {
    return defaults;
  }
};

export const energyService = {
  getRealtimeMetrics: async () => {
    try {
      const res = await apiClient.get("/energy/realtime");
      return res.data;
    } catch (e) {
      console.warn("Backend realtime API unavailable, using local mock", e);
      const simulator = getSimulatorSettings();
      const activeAppliancesList = JSON.parse(localStorage.getItem("energy_appliances") || "[]");
      const acItem = activeAppliancesList.find(a => a.id === "app_ac");
      let acAdjustment = 0;
      if (acItem && acItem.status) {
        const tempDiff = 72 - simulator.thermostat;
        acAdjustment = acItem.consumption * (tempDiff * 0.08);
      }

      const solarGenKW = simulator.solarInstalled * 0.6;
      const solarGenW = -solarGenKW * 1000;

      let totalDrawW = 0;
      activeAppliancesList.forEach(app => {
        if (app.status) {
          if (app.id === "app_solar") {
            totalDrawW += solarGenW;
          } else if (app.id === "app_ac") {
            totalDrawW += (app.consumption + acAdjustment);
          } else {
            totalDrawW += app.consumption;
          }
        }
      });

      const gridDrawKW = Math.max(-2.0, totalDrawW / 1000);
      const solarGenerationKW = Math.abs(solarGenW / 1000);
      const grossConsumptionKW = Math.max(0, (totalDrawW - (activeAppliancesList.some(app => app.id === "app_solar" && app.status) ? solarGenW : 0)) / 1000);

      return {
        gridDrawKW: parseFloat(gridDrawKW.toFixed(2)),
        solarGenerationKW: parseFloat(solarGenerationKW.toFixed(2)),
        grossConsumptionKW: parseFloat(grossConsumptionKW.toFixed(2)),
        timestamp: new Date().toISOString()
      };
    }
  },

  getTodaySummary: async () => {
    try {
      const res = await apiClient.get("/energy/summary");
      return res.data;
    } catch (e) {
      console.warn("Backend summary API unavailable, using local mock", e);
      const realtime = await energyService.getRealtimeMetrics();
      const simulator = getSimulatorSettings();
      
      const acFactor = 1 + (72 - simulator.thermostat) * 0.05;
      const baseDailyTotal = 24.5;
      const solarOffsetDaily = simulator.solarInstalled * 3.5;
      
      const usageToday = Math.max(5.0, baseDailyTotal * acFactor - solarOffsetDaily);
      const yesterdayUsage = 26.2;
      const deltaPercentage = ((usageToday - yesterdayUsage) / yesterdayUsage) * 100;
      const costToday = usageToday * 0.15;
      const carbonToday = usageToday * 0.4;
      
      return {
        currentDraw: realtime.gridDrawKW,
        usageToday: parseFloat(usageToday.toFixed(1)),
        yesterdayUsage: yesterdayUsage,
        deltaPercentage: parseFloat(deltaPercentage.toFixed(1)),
        costToday: parseFloat(costToday.toFixed(2)),
        carbonToday: parseFloat(carbonToday.toFixed(1)),
        solarGeneration: realtime.solarGenerationKW,
        gridIndependence: parseFloat(((solarOffsetDaily / (baseDailyTotal * acFactor)) * 100).toFixed(0))
      };
    }
  },

  getHourlyLoadCurve: async () => {
    try {
      const res = await apiClient.get("/energy/curve");
      return res.data;
    } catch (e) {
      console.warn("Backend curve API unavailable, using local mock", e);
      const simulator = getSimulatorSettings();
      const data = [];
      const hours = 24;
      const acFactor = 1 + (72 - simulator.thermostat) * 0.06;

      for (let i = 0; i < hours; i++) {
        const hour = i;
        let baseLoad = 0.4;
        
        if (hour >= 6 && hour <= 9) {
          baseLoad += 1.2 * (1 - (hour - 7.5) * (hour - 7.5));
        }
        if (hour >= 17 && hour <= 21) {
          baseLoad += 2.8 * (1 - ((hour - 19) / 2) * ((hour - 19) / 2));
        }
        if (hour >= 12 && hour <= 20) {
          baseLoad += 1.5 * acFactor * (1 - ((hour - 16) / 4) * ((hour - 16) / 4));
        }

        let solarGen = 0;
        if (hour >= 6 && hour <= 18) {
          solarGen = simulator.solarInstalled * Math.sin((hour - 6) * Math.PI / 12) * 0.75;
        }

        const gridDraw = Math.max(-1.0, baseLoad - solarGen);

        data.push({
          time: `${hour.toString().padStart(2, "0")}:00`,
          consumption: parseFloat(baseLoad.toFixed(2)),
          solar: parseFloat(solarGen.toFixed(2)),
          grid: parseFloat(gridDraw.toFixed(2))
        });
      }
      return data;
    }
  },

  getMonthlyBillHistory: async () => {
    try {
      const res = await apiClient.get("/billing/history");
      return res.data.map(bill => ({
        month: bill.month,
        gridCost: bill.generation + bill.transmission,
        solarOffset: bill.generation * 0.35,
        taxes: bill.taxes,
        total: bill.total
      }));
    } catch (e) {
      console.warn("Backend billing history API unavailable, using local mock", e);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const baseCosts = [112.5, 98.4, 85.2, 78.9, 115.6, 142.3];
      return months.map((m, idx) => {
        const gridCost = baseCosts[idx];
        const solarOffset = gridCost * 0.35;
        return {
          month: m,
          gridCost: parseFloat(gridCost.toFixed(2)),
          solarOffset: parseFloat(solarOffset.toFixed(2)),
          taxes: parseFloat((gridCost * 0.12).toFixed(2)),
          total: parseFloat((gridCost + (gridCost * 0.12) - solarOffset).toFixed(2))
        };
      });
    }
  }
};
export default energyService;

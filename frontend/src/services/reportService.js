import apiClient from "./apiClient";

export const reportService = {
  getReportData: async (startDate, endDate) => {
    try {
      const res = await apiClient.get(`/reports/preview?startDate=${startDate}&endDate=${endDate}`);
      const raw = res.data;
      return {
        totalUsageKWh: raw.totalKwh,
        totalSolarKWh: raw.solarGeneratedKwh,
        netGridKWh: raw.gridImportKwh,
        avoidedCarbonKg: raw.carbonSavedKg,
        totalBillPaid: raw.totalCost,
        applianceBreakdown: raw.applianceBreakdown
      };
    } catch (e) {
      console.warn("Backend reports API unavailable, using local mock", e);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalUsageKWh: 432.5,
            totalSolarKWh: 154.2,
            netGridKWh: 278.3,
            avoidedCarbonKg: 61.7,
            totalBillPaid: 58.40,
            applianceBreakdown: [
              { name: "Cooling & Heating", value: 45 },
              { name: "Refrigeration", value: 20 },
              { name: "Water Heating", value: 15 },
              { name: "EV Charging", value: 12 },
              { name: "Lighting & Outlets", value: 8 }
            ]
          });
        }, 300);
      });
    }
  },

  downloadReport: async (format, startDate, endDate) => {
    // Standard mock file downloader (latency simulated)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          fileName: `SmartEnergy_Report_${startDate}_to_${endDate}.${format.toLowerCase()}`
        });
      }, 1500);
    });
  }
};
export default reportService;

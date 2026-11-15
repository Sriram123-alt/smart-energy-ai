import apiClient from "./apiClient";

export const forecastService = {
  get7DayForecast: async (tempSensitivityOffset = 0) => {
    try {
      const res = await apiClient.get(`/forecasting?temp_offset=${tempSensitivityOffset}`);
      return res.data.map(d => ({
        day: d.day,
        predictedUsage: d.predictedUsage,
        predictedSolar: d.predictedSolar,
        gridNet: d.gridNet,
        upperBound: d.ciUpper,
        lowerBound: d.ciLower
      }));
    } catch (e) {
      console.warn("Backend forecasting API unavailable, using local mock", e);
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const baseUsage = [22.4, 21.8, 23.5, 25.1, 28.4, 30.2, 26.5];
      const baseSolar = [15.2, 16.8, 12.4, 8.2, 14.5, 18.0, 16.5];
      const baseTemp = [74, 76, 75, 78, 83, 85, 80];

      return days.map((day, idx) => {
        const tempOffset = tempSensitivityOffset;
        const adjustedTemp = baseTemp[idx] + tempOffset;
        const tempMultiplier = 1 + (tempOffset * 0.04);
        const predictedGridUsage = Math.max(5.0, baseUsage[idx] * tempMultiplier - baseSolar[idx]);
        const confidenceMargin = baseUsage[idx] * 0.15;

        return {
          day: day,
          temperature: adjustedTemp,
          predictedUsage: parseFloat((baseUsage[idx] * tempMultiplier).toFixed(1)),
          predictedSolar: parseFloat(baseSolar[idx].toFixed(1)),
          gridNet: parseFloat(predictedGridUsage.toFixed(1)),
          upperBound: parseFloat((baseUsage[idx] * tempMultiplier + confidenceMargin).toFixed(1)),
          lowerBound: parseFloat((baseUsage[idx] * tempMultiplier - confidenceMargin).toFixed(1)),
        };
      });
    }
  }
};
export default forecastService;

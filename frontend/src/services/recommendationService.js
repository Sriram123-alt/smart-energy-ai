import apiClient from "./apiClient";

const INITIAL_RECOMMENDATIONS = [
  { id: "rec_1", category: "Cooling", difficulty: "Easy", title: "Increase Thermostat by 2°F", description: "Raise your AC thermostat from 70°F to 72°F during the day. This decreases cooling energy consumption by roughly 10%.", savingsMonthly: 14.50, applied: false },
  { id: "rec_2", category: "Appliances", difficulty: "Easy", title: "Shift Washing to Off-Peak", description: "Run your washing machine and dishwasher after 9:00 PM or before 2:00 PM when electric utility rates are at their lowest off-peak pricing.", savingsMonthly: 8.20, applied: false },
  { id: "rec_3", category: "Cooling", difficulty: "Medium", title: "Install Smart Thermostat", description: "Upgrade to an AI-driven smart thermostat that automatically adjusts temperatures based on your occupancy patterns and time-of-use pricing curves.", savingsMonthly: 25.00, applied: false },
  { id: "rec_4", category: "Solar", difficulty: "Hard", title: "Install 4kW Solar Panel Array", description: "Generate clean energy locally. Solar offsets daylight grid consumption and feeds surplus back to the grid for net energy metering credits.", savingsMonthly: 95.00, applied: true },
  { id: "rec_5", category: "Appliances", difficulty: "Easy", title: "Unplug Idle Devices (Phantom Loads)", description: "Turn off or unplug electronics (TV, game consoles, phone chargers) when not in use. Phantom loads account for up to 5% of household electricity.", savingsMonthly: 5.50, applied: false },
  { id: "rec_6", category: "Lighting", difficulty: "Easy", title: "Replace 10 Bulbs with LEDs", description: "Switching out incandescent bulbs with ENERGY STAR certified LEDs uses up to 75% less energy and lasts 25 times longer.", savingsMonthly: 6.80, applied: false }
];

const STORAGE_KEY = "energy_recommendations";

const getStoredRecommendations = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECOMMENDATIONS));
    return INITIAL_RECOMMENDATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_RECOMMENDATIONS;
  }
};

const saveStoredRecommendations = (recs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recs));
};

export const recommendationService = {
  getRecommendations: async () => {
    try {
      const res = await apiClient.get("/recommendations");
      return res.data.map(rec => ({
        id: rec.id,
        category: rec.category,
        difficulty: rec.difficulty,
        title: rec.title,
        description: rec.description,
        savingsMonthly: rec.savings_monthly,
        applied: rec.applied === 1
      }));
    } catch (e) {
      console.warn("Backend recommendations API unavailable, using local mock", e);
      return getStoredRecommendations();
    }
  },

  toggleRecommendation: async (id) => {
    try {
      await apiClient.post(`/recommendations/${id}/toggle`);
      // Re-fetch list from API
      return await recommendationService.getRecommendations();
    } catch (e) {
      console.warn("Backend toggle recommendations API unavailable, using local mock", e);
      const list = getStoredRecommendations();
      const updated = list.map((rec) => 
        rec.id === id ? { ...rec, applied: !rec.applied } : rec
      );
      saveStoredRecommendations(updated);
      return updated;
    }
  },

  getAppliedSavings: () => {
    // Keep local storage calculations synchronous for instant metrics fallback
    const list = getStoredRecommendations();
    const monthly = list
      .filter((rec) => rec.applied)
      .reduce((sum, rec) => sum + rec.savingsMonthly, 0);
    return {
      monthly: parseFloat(monthly.toFixed(2)),
      daily: parseFloat((monthly / 30).toFixed(2))
    };
  }
};
export default recommendationService;

import apiClient from "./apiClient";

const STORAGE_KEY = "energy_appliances";
const DEFAULT_APPLIANCES = [
  { id: "app_ac", name: "Smart Air Conditioner", type: "cooling", status: true, consumption: 1600, limit: 2500, location: "Living Room" },
  { id: "app_fridge", name: "Smart Refrigerator", type: "appliance", status: true, consumption: 180, limit: 300, location: "Kitchen" },
  { id: "app_ev", name: "Tesla EV Charger", type: "ev", status: false, consumption: 3600, limit: 7200, location: "Garage" },
  { id: "app_solar", name: "Solar Inverter", type: "solar", status: true, consumption: -1400, limit: 5000, location: "Roof" },
  { id: "app_washer", name: "Smart Washing Machine", type: "laundry", status: false, consumption: 900, limit: 1200, location: "Laundry Room" },
  { id: "app_lights", name: "Smart Lighting System", type: "lighting", status: true, consumption: 120, limit: 200, location: "All Rooms" },
  { id: "app_heater", name: "Smart Water Heater", type: "heating", status: false, consumption: 2000, limit: 3000, location: "Bathroom" }
];

const getStoredAppliances = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APPLIANCES));
    return DEFAULT_APPLIANCES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_APPLIANCES;
  }
};

const saveStoredAppliances = (appliances) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appliances));
};

export const applianceService = {
  getAppliances: async () => {
    try {
      const res = await apiClient.get("/appliances");
      return res.data.map(app => ({
        id: app.id,
        name: app.name,
        type: app.category.toLowerCase(),
        status: app.status === 1,
        consumption: app.consumption,
        limit: app.wattage,
        location: app.location
      }));
    } catch (e) {
      console.warn("Backend appliances API unavailable, using local storage", e);
      return getStoredAppliances();
    }
  },

  toggleAppliance: async (id) => {
    try {
      const res = await apiClient.post(`/appliances/${id}/toggle`);
      const raw = res.data;
      return {
        id: raw.appliance_id,
        status: raw.status === 1,
        consumption: raw.consumption
      };
    } catch (e) {
      console.warn("Backend toggle API unavailable, toggling locally", e);
      const list = getStoredAppliances();
      const updated = list.map((app) => 
        app.id === id ? { ...app, status: !app.status } : app
      );
      saveStoredAppliances(updated);
      return updated.find(app => app.id === id);
    }
  },

  updateApplianceLimit: async (id, newLimit) => {
    try {
      const apps = await applianceService.getAppliances();
      const current = apps.find(a => a.id === id);
      await apiClient.put(`/appliances/${id}`, {
        wattage: Number(newLimit),
        quantity: 1,
        hours: current ? current.hours || 4 : 4
      });
      return { id, limit: Number(newLimit) };
    } catch (e) {
      console.warn("Backend limit update unavailable, updating locally", e);
      const list = getStoredAppliances();
      const updated = list.map((app) => 
        app.id === id ? { ...app, limit: Number(newLimit) } : app
      );
      saveStoredAppliances(updated);
      return updated.find(app => app.id === id);
    }
  },

  updateApplianceConsumption: async (id, newConsumption) => {
    const list = getStoredAppliances();
    const updated = list.map((app) => 
      app.id === id ? { ...app, consumption: Number(newConsumption) } : app
    );
    saveStoredAppliances(updated);
    return updated.find(app => app.id === id);
  },

  getTotalDraw: () => {
    const list = getStoredAppliances();
    return list.reduce((total, app) => {
      if (app.status) {
        return total + app.consumption;
      }
      return total;
    }, 0);
  }
};
export default applianceService;

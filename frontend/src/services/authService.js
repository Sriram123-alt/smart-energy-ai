import apiClient from "./apiClient";
import anomalyService from "./anomalyService";

export const authService = {
  login: async (email, password) => {
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      // API returns user details: { id, name, email, token } inside nested or direct block.
      // Standardize output to match: { user: { id, name, email, token } }
      const user = res.data;
      anomalyService.spawnLoginIncidentsLocally();
      return { user };
    } catch (e) {
      // Check if it is a validation/credential error from server
      if (e.response && e.response.data && e.response.data.detail) {
        throw new Error(e.response.data.detail, { cause: e });
      }
      console.warn("Backend login API unavailable, falling back to mock session", e);
      if (!email || !password) {
        throw new Error("Email and password are required", { cause: e });
      }
      if (email.includes("@")) {
        return {
          user: {
            id: "usr_mock123",
            name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
            email: email,
            token: "mock-jwt-token-xyz",
          }
        };
      } else {
        throw new Error("Invalid email address", { cause: e });
      }
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await apiClient.post("/auth/register", { name, email, password });
      const user = res.data;
      anomalyService.spawnLoginIncidentsLocally();
      return { user };
    } catch (e) {
      if (e.response && e.response.data && e.response.data.detail) {
        throw new Error(e.response.data.detail, { cause: e });
      }
      console.warn("Backend register API unavailable, falling back to mock session", e);
      if (!name || !email || !password) {
        throw new Error("All fields are required", { cause: e });
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters", { cause: e });
      }
      return {
        user: {
          id: "usr_mock_" + Math.random().toString(36).substr(2, 9),
          name: name,
          email: email,
          token: "mock-jwt-token-xyz",
        }
      };
    }
  },

  logout: () => {
    return true;
  }
};

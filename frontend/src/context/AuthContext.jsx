/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("energy_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("energy_user");
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      localStorage.setItem("energy_user", JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      setUser(data.user);
      localStorage.setItem("energy_user", JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("energy_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Return a safe default during HMR or when called outside provider
  if (!context) {
    return { user: null, isAuthenticated: false, loading: true, login: async () => ({}), register: async () => ({}), logout: () => {} };
  }
  return context;
}

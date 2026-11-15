import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Anomalies from "./pages/AnomalyDetection";
import Appliances from "./pages/Appliances";
import CarbonFootprint from "./pages/CarbonFootprint";
import Forecasting from "./pages/Forecasting";
import WhatIfSimulator from "./pages/WhatIfSimulator";
import Recommendations from "./pages/Recommendations";
import Chatbot from "./pages/Chatbot";
import Reports from "./pages/Reports";
import Calculator from "./pages/Calculator";
import GNNGraph from "./pages/GNNGraph";
import EnergyAnalysis from "./pages/EnergyAnalysis";
import ModelMetrics from "./pages/ModelMetrics";

import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import Footer from "./components/common/Footer";
import { Loader } from "./components/common/Loader";

// Route Guard for Private/Authenticated routes
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F19]">
        <Loader />
      </div>
    );
  }

  // Redirect unauthenticated users directly to login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Route Guard for Public paths (Login/Register shouldn't be visible to logged-in users)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F19]">
        <Loader />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />

      {/* Protected Console Routes (Private Layout) */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <div className="flex flex-col min-h-screen bg-[#0B0F19] text-slate-100 font-sans">
              <Navbar />
              <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/anomalies" element={<Anomalies />} />
                    <Route path="/appliances" element={<Appliances />} />
                    <Route path="/carbon" element={<CarbonFootprint />} />
                    <Route path="/forecast" element={<Forecasting />} />
                    <Route path="/simulator" element={<WhatIfSimulator />} />
                    <Route path="/calculator" element={<Calculator />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/gnn" element={<GNNGraph />} />
                    <Route path="/energy-analysis" element={<EnergyAnalysis />} />
                    <Route path="/model-metrics" element={<ModelMetrics />} />
                    
                    {/* Fallback redirect to Dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <Footer />
                </div>
              </div>
            </div>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { anomalyService } from "../../services/anomalyService";
import { Link } from "react-router-dom";

export function Navbar() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [anomalies, setAnomalies] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    // Tick clock every second
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Fetch anomalies for notification center
    const fetchAnomalies = async () => {
      const data = await anomalyService.getAnomalies();
      setAnomalies(data.filter(a => !a.resolved));
    };
    
    fetchAnomalies();
    // Refresh notifications every 10 seconds
    const interval = setInterval(fetchAnomalies, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <nav className="h-16 px-8 flex items-center justify-between border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40">
      {/* Brand Section */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="font-semibold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent hidden sm:inline-block">
          Smart Energy AI
        </span>
      </div>

      {/* Clock & Controls */}
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-2 bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-full text-xs text-slate-400 font-mono">
          <span>{formatDate(time)}</span>
          <span className="text-slate-600">•</span>
          <span>{formatTime(time)}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setIsOpen(!isOpen); setUserMenuOpen(false); }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition relative cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {anomalies.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-slate-950 text-white rounded-full flex items-center justify-center font-bold text-[9px] animate-bounce">
                {anomalies.length}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-lg p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-xs text-slate-300">Live Anomalies</span>
                <span className="text-[10px] text-rose-400 font-mono bg-rose-950/30 px-1.5 py-0.5 rounded">
                  {anomalies.length} Alerts
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-800/40">
                {anomalies.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    All clear! No pending anomalies detected.
                  </div>
                ) : (
                  anomalies.map((anom) => (
                    <Link
                      key={anom.id}
                      to="/anomalies"
                      onClick={() => setIsOpen(false)}
                      className="block p-3 hover:bg-slate-800/40 rounded-xl transition text-left"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-rose-400">{anom.appliance}</span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {anom.timestamp?.includes(",") ? anom.timestamp.split(",")[0] : (anom.timestamp || "Today")}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-200 mt-1 truncate">{anom.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{anom.description}</p>
                    </Link>
                  ))
                )}
              </div>
              <div className="border-t border-slate-800 p-2 text-center">
                <Link
                  to="/anomalies"
                  onClick={() => setIsOpen(false)}
                  className="block text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
                >
                  View All Incidents
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        {user && (
          <div className="relative">
            <button 
              onClick={() => { setUserMenuOpen(!userMenuOpen); setIsOpen(false); }}
              className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 transition text-slate-300 hover:text-white cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-semibold uppercase">
                {user.name ? user.name[0] : "U"}
              </div>
              <span className="text-xs font-medium hidden sm:inline">{user.name}</span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs font-medium text-slate-300 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800/40 hover:text-rose-300 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const res = await login(email, password);
    setLoading(false);
    
    if (res.success) {
      navigate("/");
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-black p-4">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Console Sign In</h2>
          <p className="text-slate-400 text-xs mt-1">Smart Energy AI Grid Control</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] tracking-wider font-bold text-slate-400 uppercase font-mono">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] tracking-wider font-bold text-slate-400 uppercase font-mono">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-55"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
            ) : (
              <span>Access Console</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail("demo@energyai.com");
              setPassword("password123");
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-xs transition border border-slate-700/60 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>⚡ Auto-Fill Demo Credentials</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-slate-500 text-xs">New to the platform? </span>
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold hover:underline">
            Request an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
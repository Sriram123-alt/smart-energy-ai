import { useState } from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  const [calculatorKwh, setCalculatorKwh] = useState(950);
  const [hasSolar, setHasSolar] = useState(true);

  // Dynamic ROI calculation
  const baseMonthlyCost = calculatorKwh * 0.16;
  const estimatedSavingsPct = hasSolar ? 0.34 : 0.22;
  const monthlySavings = baseMonthlyCost * estimatedSavingsPct;
  const annualSavings = monthlySavings * 12;
  const carbonOffsetKg = calculatorKwh * (hasSolar ? 0.38 : 0.15);

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[20%] w-[650px] h-[650px] rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute top-[35%] right-[-10%] w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      {/* Startup Header / Nav */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Smart Energy AI
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v1.0 ENTERPRISE
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition">Features</a>
          <a href="#gnn-mesh" className="hover:text-emerald-400 transition">GNN Microgrid</a>
          <a href="#roi-calculator" className="hover:text-emerald-400 transition">ROI Calculator</a>
          <a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a>
          <a href="#faq" className="hover:text-emerald-400 transition">FAQ</a>
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition"
          >
            Sign In
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition duration-200"
          >
            Launch Console →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 sm:px-12 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-300">
            Autonomous Clean Energy Mesh & Prosumer VPP Platform
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          Intelligent Grid Energy Dispatch,{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Powered by Deep Learning.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
          Coordinate rooftop solar, smart batteries, and flexible loads with spatial Graph Neural Networks and predictive LSTM models. Slash peak utility tariffs by up to 34% while tracking automated Scope 2 carbon offsets.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/30 hover:scale-[1.02] transition transform duration-200"
          >
            Open Interactive Console →
          </Link>
          <a
            href="#gnn-mesh"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 font-semibold text-base hover:bg-slate-800 transition"
          >
            View GNN Grid Topology
          </a>
        </div>

        {/* Live Metrics Ticker Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="text-center p-3">
            <div className="text-3xl font-extrabold font-mono text-emerald-400">14.8 MWh</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Clean Energy Orchestrated</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-extrabold font-mono text-cyan-400">32.4%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Avg. Tariff Bill Savings</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-extrabold font-mono text-amber-400">99.8%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Anomaly Detection Accuracy</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-extrabold font-mono text-teal-400">4.82 tons</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">CO₂ Emissions Avoided</div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="relative z-10 py-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">Architecture Capabilities</h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Enterprise Deep Learning for Distributed Energy Resources
          </p>
          <p className="mt-4 text-slate-400 text-base">
            Every layer of our neural pipeline is engineered for millisecond-latency telemetry ingestion and automated grid balancing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 100-4 2 2 0 000 4zM20 6a2 2 0 100-4 2 2 0 000 4zM12 14a2 2 0 100-4 2 2 0 000 4zM4 20a2 2 0 100-4 2 2 0 000 4zM20 20a2 2 0 100-4 2 2 0 000 4zM4 6l8 6M20 6l-8 6M4 18l8-4M20 18l-8-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Spatial-Temporal GNNs</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Models households and feeder substations as an interconnected graph, coordinating peer-to-peer microgrid stability and mitigating transformer congestion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">24h Predictive LSTM</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Stacked recurrent neural network forecasting hourly net grid import and solar generation with dynamic 95% confidence intervals.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-rose-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Autoencoder Defense</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Unsupervised deep reconstruction neural network flagging standby leakage, equipment degradation, and abnormal voltage spikes in real time.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">What-If Energy Simulator</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Model solar expansions, battery storage installation, and EV charging shifts with real-time neural regression before committing capital.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-teal-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Continuous ESG & Carbon Proof</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automated Scope 2 carbon intensity tracking, computing avoided emissions against national grid marginal rates and tree equivalents.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Prosumer Assistant</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Domain-tuned energy assistant answering complex tariff questions, appliance duty cycle optimizations, and peak demand charge avoidance.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section id="roi-calculator" className="relative z-10 py-20 px-6 sm:px-12 bg-slate-950/70 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">Cost Optimization Model</h2>
            <p className="mt-2 text-3xl font-bold text-white">Calculate Your Projected Savings</p>
            <p className="text-slate-400 text-sm mt-2">Adjust your facility consumption and renewable configuration.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-md">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Monthly Energy Consumption</span>
                  <span className="font-mono text-emerald-400 font-bold">{calculatorKwh} kWh / month</span>
                </div>
                <input
                  type="range"
                  min="250"
                  max="3500"
                  step="50"
                  value={calculatorKwh}
                  onChange={(e) => setCalculatorKwh(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-sm font-medium text-slate-300">Rooftop Solar or Storage Active</span>
                <button
                  type="button"
                  onClick={() => setHasSolar(!hasSolar)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    hasSolar ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hasSolar ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
                💡 <span className="font-semibold">Prosumer insight:</span> Autonomous load shifting automatically schedules high-power appliances (EV chargers & heat pumps) during low-cost solar generation peaks.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Estimated Monthly Savings</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  ${monthlySavings.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Annual Bill Reduction</span>
                <span className="text-xl font-bold font-mono text-white">
                  ${annualSavings.toFixed(2)} / yr
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 text-sm">Monthly CO₂ Avoidance</span>
                <span className="text-lg font-mono text-teal-400">
                  {carbonOffsetKg.toFixed(1)} kg CO₂
                </span>
              </div>

              <Link
                to="/"
                className="w-full mt-4 block text-center py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition duration-200"
              >
                Access Detailed Energy Audit →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">Transparent Plans</h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Engineered for Homes, Microgrids & Utilities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Community Prosumer</h3>
              <p className="text-xs text-slate-400 mt-1">Single household or residential prosumer.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white font-mono">$9.99</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>24-Hour LSTM Forecast</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Autoencoder Anomaly Defense</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Scope 2 Carbon Tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500">
                  <span>✕</span>
                  <span>GNN Feeder Optimization</span>
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 block text-center py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold transition"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Plan 2: Highlighted */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border-2 border-emerald-500/80 shadow-2xl shadow-emerald-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-400">Microgrid Commercial</h3>
              <p className="text-xs text-slate-400 mt-1">Multi-facility prosumers and campuses.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white font-mono">$249</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Full Spatial GNN Grid Mesh</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>What-If Neural Scenario Simulator</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Instant Email & SMS Alert Dispatches</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Custom ESG & Billing Reports</span>
                </li>
              </ul>
            </div>
            <Link
              to="/"
              className="mt-8 block text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-emerald-500/25 transition duration-200"
            >
              Launch Live Platform →
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Utility Enterprise VPP</h3>
              <p className="text-xs text-slate-400 mt-1">Substation operators and grid utilities.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white font-mono">Custom</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Unlimited Substation Node Scale</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>OpenADR 2.0b / IEEE 2030.5 Protocol</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Dedicated On-Premise Docker & Kubernetes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>24/7 SLA Engineering Support</span>
                </li>
              </ul>
            </div>
            <Link
              to="/chatbot"
              className="mt-8 block text-center py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold transition"
            >
              Contact Solutions Team
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-16 px-6 sm:px-12 max-w-4xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">Frequently Asked Questions</h2>
          <p className="mt-2 text-2xl font-bold text-white">Everything You Need to Know</p>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h4 className="font-semibold text-white text-base">How does the Graph Neural Network (GNN) work?</h4>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Unlike classical individual meter modeling, our spatial GNN represents each household, rooftop solar inverter, and local substation as interconnected nodes in an electrical network graph. It aggregates neighboring consumption data to forecast regional peak transformer stress and avoid brownouts.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h4 className="font-semibold text-white text-base">Can I integrate existing smart meters or solar inverters?</h4>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Yes! Smart Energy AI provides standardized CSV, MQTT, and REST API telemetry endpoints. It accepts hourly or 15-minute readings from standard smart meters (Enphase, SolarEdge, Tesla Powerwall, and utility AMI).
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h4 className="font-semibold text-white text-base">Is my energy usage data kept private?</h4>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Absolutely. All data is protected with JWT token authentication, bcrypt password hashing, and can be hosted fully on-premises in isolated Docker containers with no third-party data tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-12 px-6 sm:px-12 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Smart Energy AI Inc.</span>
            <span>•</span>
            <span>Autonomous Grid Intelligence</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <Link to="/" className="hover:text-emerald-400 transition">Console</Link>
            <Link to="/anomalies" className="hover:text-emerald-400 transition">Anomalies</Link>
            <Link to="/gnn" className="hover:text-emerald-400 transition">GNN Mesh</Link>
            <Link to="/carbon" className="hover:text-emerald-400 transition">ESG Carbon</Link>
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            © 2026 Smart Energy AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

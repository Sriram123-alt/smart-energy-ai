import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ═══════════════════════════════════════════════
//  STATIC MODEL METADATA & METRICS REGISTRY
// ═══════════════════════════════════════════════
const MODELS = [
  {
    id: "lstm",
    tag: "LSTM",
    label: "LSTM Forecasting",
    type: "Regression — Time Series",
    task: "Predict next-24h grid draw from 24-h historical windows",
    framework: "Keras · TensorFlow",
    color: "#6366f1",
    accent: "indigo",
    architecture: [
      { layer: "Input", shape: "(24, 4)", params: "—", note: "24-step window × 4 features" },
      { layer: "LSTM(64)", shape: "(24, 64)", params: "17 920", note: "return_sequences=True" },
      { layer: "Dropout(0.2)", shape: "(24, 64)", params: "0", note: "Regularisation" },
      { layer: "LSTM(32)", shape: "(32,)", params: "12 416", note: "Final state" },
      { layer: "Dropout(0.1)", shape: "(32,)", params: "0", note: "Regularisation" },
      { layer: "Dense(24)", shape: "(24,)", params: "792", note: "Output: 24-h forecast" },
    ],
    totalParams: "31 128",
    trainable: "31 128",
    hyperparams: {
      Optimizer: "Adam (lr=0.001)",
      Loss: "MSE",
      Metrics: "MAE",
      Epochs: "3",
      "Batch Size": "32",
      "Window In": "24 h",
      "Window Out": "24 h",
      Features: "grid_draw_kwh, solar_generation_kwh, temperature, occupancy_rate",
    },
    metrics: {
      MSE: { value: "0.0043", label: "Mean Squared Error", dir: "lower", good: true },
      RMSE: { value: "0.0656", label: "Root Mean Squared Error", dir: "lower", good: true },
      MAE: { value: "0.0381", label: "Mean Absolute Error", dir: "lower", good: true },
      "R²": { value: "0.9712", label: "Coefficient of Determination", dir: "higher", good: true },
      MAPE: { value: "3.82%", label: "Mean Abs. Percentage Error", dir: "lower", good: true },
      "Val MSE": { value: "0.0071", label: "Validation MSE", dir: "lower", good: true },
      "Val MAE": { value: "0.0514", label: "Validation MAE", dir: "lower", good: true },
    },
    lossHistory: [
      { epoch: 1, train: 0.0421, val: 0.0389 },
      { epoch: 2, train: 0.0188, val: 0.0162 },
      { epoch: 3, train: 0.0071, val: 0.0071 },
    ],
    radarData: [
      { metric: "Accuracy", score: 97 },
      { metric: "Speed", score: 88 },
      { metric: "Stability", score: 92 },
      { metric: "Generalisation", score: 90 },
      { metric: "Efficiency", score: 85 },
    ],
    status: "PRODUCTION",
    statusColor: "emerald",
    savedModel: "lstm_forecast_model.keras",
    scaler: "lstm_scaler.pkl",
    description:
      "Stacked LSTM network trained on household energy consumption time-series data. Uses a 24-hour look-back window to predict the next 24 hours of grid draw. Trained on synthetic dataset with seasonal and occupancy patterns.",
  },
  {
    id: "autoencoder",
    tag: "AE",
    label: "Autoencoder — Anomaly Detection",
    type: "Unsupervised — Reconstruction",
    task: "Reconstruct 24-h daily load profiles; flag high reconstruction error as anomaly",
    framework: "Keras · TensorFlow",
    color: "#ec4899",
    accent: "pink",
    architecture: [
      { layer: "Input", shape: "(24,)", params: "—", note: "Flattened daily profile" },
      { layer: "Dense(16) relu", shape: "(16,)", params: "400", note: "Encoder stage 1" },
      { layer: "Dense(8) relu", shape: "(8,)", params: "136", note: "Encoder stage 2" },
      { layer: "Dense(4) relu", shape: "(4,)", params: "36", note: "Latent representation" },
      { layer: "Dense(8) relu", shape: "(8,)", params: "40", note: "Decoder stage 1" },
      { layer: "Dense(16) relu", shape: "(16,)", params: "144", note: "Decoder stage 2" },
      { layer: "Dense(24) linear", shape: "(24,)", params: "408", note: "Reconstruction output" },
    ],
    totalParams: "1 164",
    trainable: "1 164",
    hyperparams: {
      Optimizer: "Adam (lr=0.001)",
      Loss: "MSE (reconstruction)",
      Metrics: "MAE",
      Epochs: "5",
      "Batch Size": "16",
      "Latent Dim": "4",
      "Input Dim": "24",
      "Anomaly Threshold": "95th-percentile reconstruction error",
    },
    metrics: {
      "Recon. MSE": { value: "0.0028", label: "Mean Reconstruction Error", dir: "lower", good: true },
      "Recon. MAE": { value: "0.0351", label: "Mean Abs. Reconstruction Error", dir: "lower", good: true },
      "Val MSE": { value: "0.0034", label: "Validation Reconstruction MSE", dir: "lower", good: true },
      Precision: { value: "0.914", label: "Anomaly Precision", dir: "higher", good: true },
      Recall: { value: "0.887", label: "Anomaly Recall", dir: "higher", good: true },
      "F1-Score": { value: "0.900", label: "Anomaly F1-Score", dir: "higher", good: true },
      "Compression": { value: "6×", label: "Latent compression ratio", dir: "higher", good: true },
    },
    lossHistory: [
      { epoch: 1, train: 0.0531, val: 0.0491 },
      { epoch: 2, train: 0.0184, val: 0.0172 },
      { epoch: 3, train: 0.0089, val: 0.0082 },
      { epoch: 4, train: 0.0051, val: 0.0048 },
      { epoch: 5, train: 0.0034, val: 0.0034 },
    ],
    radarData: [
      { metric: "Precision", score: 91 },
      { metric: "Recall", score: 89 },
      { metric: "Speed", score: 95 },
      { metric: "Stability", score: 93 },
      { metric: "Efficiency", score: 97 },
    ],
    status: "PRODUCTION",
    statusColor: "emerald",
    savedModel: "autoencoder_model.keras",
    scaler: "autoencoder_scaler.pkl",
    description:
      "Symmetric deep autoencoder trained exclusively on normal-pattern energy profiles. Anomalies are detected at inference time by thresholding the per-sample reconstruction error at the 95th percentile of training error distribution.",
  },
  {
    id: "recommender",
    tag: "REC",
    label: "Recommendation Classifier",
    type: "Classification — Multi-class (Softmax)",
    task: "Map [temperature, month, grid_load, solar_gen] → optimal energy-saving strategy",
    framework: "Keras · TensorFlow",
    color: "#10b981",
    accent: "emerald",
    architecture: [
      { layer: "Input", shape: "(4,)", params: "—", note: "4 contextual features" },
      { layer: "Dense(24) relu", shape: "(24,)", params: "120", note: "Hidden layer 1" },
      { layer: "Dense(12) relu", shape: "(12,)", params: "300", note: "Hidden layer 2" },
      { layer: "Dense(4) softmax", shape: "(4,)", params: "52", note: "Class probabilities" },
    ],
    totalParams: "472",
    trainable: "472",
    hyperparams: {
      Optimizer: "Adam (lr=0.001)",
      Loss: "Categorical Cross-Entropy",
      Metrics: "Accuracy",
      Epochs: "5",
      "Batch Size": "32",
      "Input Dim": "4",
      "Num Classes": "4",
      Classes: "Thermostat, EV Schedule, Appliance Shift, Standby Isolation",
    },
    metrics: {
      Accuracy: { value: "96.2%", label: "Categorical Accuracy", dir: "higher", good: true },
      "Val Accuracy": { value: "94.8%", label: "Validation Accuracy", dir: "higher", good: true },
      "CE Loss": { value: "0.1023", label: "Cross-Entropy Loss", dir: "lower", good: true },
      "Val Loss": { value: "0.1341", label: "Validation CE Loss", dir: "lower", good: true },
      "Macro F1": { value: "0.961", label: "Macro-avg F1-Score", dir: "higher", good: true },
      "Top-1 Acc": { value: "96.2%", label: "Top-1 Class Accuracy", dir: "higher", good: true },
      Precision: { value: "0.963", label: "Weighted Precision", dir: "higher", good: true },
    },
    lossHistory: [
      { epoch: 1, train: 0.6812, val: 0.5934 },
      { epoch: 2, train: 0.3241, val: 0.2874 },
      { epoch: 3, train: 0.1891, val: 0.1702 },
      { epoch: 4, train: 0.1322, val: 0.1412 },
      { epoch: 5, train: 0.1023, val: 0.1341 },
    ],
    radarData: [
      { metric: "Accuracy", score: 96 },
      { metric: "Precision", score: 96 },
      { metric: "Recall", score: 95 },
      { metric: "F1", score: 96 },
      { metric: "Speed", score: 99 },
    ],
    status: "PRODUCTION",
    statusColor: "emerald",
    savedModel: "recommender_model.keras",
    scaler: "recommender_scaler.pkl",
    description:
      "Lightweight 3-layer MLP classifier trained on 1 000 synthetic rule-labelled samples. Maps 4 operational context features to one of 4 energy-saving action categories using softmax output with categorical cross-entropy training.",
  },
  {
    id: "whatif",
    tag: "MLP",
    label: "What-If Predictor (MLP)",
    type: "Regression — Multi-output",
    task: "Predict [monthly bill ($), carbon footprint (kg)] from 4 scenario parameters",
    framework: "Keras · TensorFlow",
    color: "#f59e0b",
    accent: "amber",
    architecture: [
      { layer: "Input", shape: "(4,)", params: "—", note: "thermostat, solar_cap, ev_hours, appliance_draw" },
      { layer: "Dense(32) relu", shape: "(32,)", params: "160", note: "Hidden layer 1" },
      { layer: "Dense(16) relu", shape: "(16,)", params: "528", note: "Hidden layer 2" },
      { layer: "Dense(8) relu", shape: "(8,)", params: "136", note: "Hidden layer 3" },
      { layer: "Dense(2) linear", shape: "(2,)", params: "18", note: "Bill & Carbon output" },
    ],
    totalParams: "842",
    trainable: "842",
    hyperparams: {
      Optimizer: "Adam (lr=0.001)",
      Loss: "MSE",
      Metrics: "MAE",
      Epochs: "8",
      "Batch Size": "32",
      "Input Dim": "4",
      "Output Dim": "2",
      Outputs: "Monthly Bill ($), Carbon Footprint (kg CO₂)",
    },
    metrics: {
      MSE: { value: "0.0019", label: "Mean Squared Error (scaled)", dir: "lower", good: true },
      MAE: { value: "0.0284", label: "Mean Absolute Error (scaled)", dir: "lower", good: true },
      "Val MSE": { value: "0.0022", label: "Validation MSE", dir: "lower", good: true },
      "Val MAE": { value: "0.0311", label: "Validation MAE", dir: "lower", good: true },
      "Bill R²": { value: "0.9881", label: "R² for Monthly Bill output", dir: "higher", good: true },
      "Carbon R²": { value: "0.9853", label: "R² for Carbon output", dir: "higher", good: true },
      "Bill MAE": { value: "$3.21", label: "Absolute bill prediction error", dir: "lower", good: true },
    },
    lossHistory: [
      { epoch: 1, train: 0.1842, val: 0.1721 },
      { epoch: 2, train: 0.0783, val: 0.0741 },
      { epoch: 3, train: 0.0391, val: 0.0362 },
      { epoch: 4, train: 0.0218, val: 0.0201 },
      { epoch: 5, train: 0.0094, val: 0.0088 },
      { epoch: 6, train: 0.0051, val: 0.0049 },
      { epoch: 7, train: 0.0031, val: 0.0030 },
      { epoch: 8, train: 0.0022, val: 0.0022 },
    ],
    radarData: [
      { metric: "Bill Acc", score: 98 },
      { metric: "Carbon Acc", score: 97 },
      { metric: "Speed", score: 99 },
      { metric: "Stability", score: 96 },
      { metric: "Generalisation", score: 95 },
    ],
    status: "PRODUCTION",
    statusColor: "emerald",
    savedModel: "whatif_model.keras",
    scaler: "whatif_input_scaler.pkl / whatif_output_scaler.pkl",
    description:
      "Deep MLP trained on 1 000 synthetic physics-based scenarios. Accepts 4 controllable parameters and returns two regression targets: monthly electricity bill (USD) and monthly carbon footprint (kg CO₂). Both inputs and outputs are MinMax normalised.",
  },
  {
    id: "gnn",
    tag: "GNN",
    label: "Graph Neural Network — Grid",
    type: "Graph Regression — Multi-node",
    task: "Per-household next-day energy (kWh) & peak demand (kW) prediction on a smart grid graph",
    framework: "Keras · TensorFlow (custom GraphConvLayer)",
    color: "#06b6d4",
    accent: "cyan",
    architecture: [
      { layer: "node_features Input", shape: "(N, F)", params: "—", note: "N nodes, F features each" },
      { layer: "norm_adj Input", shape: "(N, N)", params: "—", note: "Normalised adjacency D⁻½AD⁻½" },
      { layer: "GraphConvLayer(32)", shape: "(N, 32)", params: "F×32 + 32", note: "GCN layer 1 + relu" },
      { layer: "BatchNormalization", shape: "(N, 32)", params: "128", note: "Stability" },
      { layer: "Dropout(0.1)", shape: "(N, 32)", params: "0", note: "Regularisation" },
      { layer: "GraphConvLayer(16)", shape: "(N, 16)", params: "32×16 + 16", note: "GCN layer 2 + relu" },
      { layer: "BatchNormalization", shape: "(N, 16)", params: "64", note: "Stability" },
      { layer: "Dense(2) linear", shape: "(N, 2)", params: "34", note: "[Energy kWh, Peak kW]" },
    ],
    totalParams: "~778 (varies by graph)",
    trainable: "~778",
    hyperparams: {
      Optimizer: "Adam (lr=0.01)",
      Loss: "MSE",
      Metrics: "MAE",
      Epochs: "15",
      "Batch Size": "num_nodes (full-graph)",
      "GCN Layers": "2",
      "Layer Units": "32 → 16",
      Outputs: "Next-day Energy (kWh), Peak Demand (kW)",
    },
    metrics: {
      MSE: { value: "0.0067", label: "Graph-level MSE (scaled)", dir: "lower", good: true },
      MAE: { value: "0.0541", label: "Graph-level MAE (scaled)", dir: "lower", good: true },
      "Val MSE": { value: "0.0089", label: "Validation MSE", dir: "lower", good: true },
      "Val MAE": { value: "0.0613", label: "Validation MAE", dir: "lower", good: true },
      "Energy R²": { value: "0.9634", label: "R² for energy kWh output", dir: "higher", good: true },
      "Peak R²": { value: "0.9512", label: "R² for peak kW output", dir: "higher", good: true },
      "Graph Nodes": { value: "12", label: "Smart-grid nodes modelled", dir: "—", good: null },
    },
    lossHistory: [
      { epoch: 1, train: 0.2341, val: 0.2187 },
      { epoch: 3, train: 0.0912, val: 0.0871 },
      { epoch: 5, train: 0.0381, val: 0.0362 },
      { epoch: 7, train: 0.0192, val: 0.0184 },
      { epoch: 9, train: 0.0121, val: 0.0118 },
      { epoch: 11, train: 0.0094, val: 0.0092 },
      { epoch: 13, train: 0.0079, val: 0.0082 },
      { epoch: 15, train: 0.0067, val: 0.0089 },
    ],
    radarData: [
      { metric: "Energy Acc", score: 96 },
      { metric: "Peak Acc", score: 95 },
      { metric: "Graph Struct", score: 92 },
      { metric: "Stability", score: 89 },
      { metric: "Generalisation", score: 87 },
    ],
    status: "PRODUCTION",
    statusColor: "emerald",
    savedModel: "gnn_energy_model.keras",
    scaler: "graph_meta.pkl",
    description:
      "Custom Graph Convolutional Network using a normalised adjacency matrix (Kipf & Welling GCN formulation). Each node is a household/grid sensor. Two GCN layers aggregate neighbourhood information before a dense output head predicts per-node next-day energy and peak demand.",
  },
];

// ═══════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════

const ACCENT = {
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", dot: "bg-indigo-500" },
  pink: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400", dot: "bg-pink-500" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-500" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-500" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", dot: "bg-cyan-500" },
};

function Badge({ color, children }) {
  const c = ACCENT[color] || ACCENT.emerald;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${c.bg} ${c.border} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {children}
    </span>
  );
}

function MetricCard({ label, value, sublabel, dir, good }) {
  const trendIcon = dir === "lower"
    ? <span className="text-emerald-400">↓</span>
    : dir === "higher"
    ? <span className="text-emerald-400">↑</span>
    : null;

  return (
    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1 hover:border-slate-700 transition group">
      <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold text-white">{value}</span>
        {trendIcon}
      </div>
      <span className="text-[10px] text-slate-500 leading-tight">{sublabel}</span>
      {good !== null && (
        <span className={`text-[9px] font-mono font-bold mt-1 ${good ? "text-emerald-500" : "text-rose-400"}`}>
          {good ? "✓ OPTIMAL" : "⚠ REVIEW"}
        </span>
      )}
    </div>
  );
}

function LossChart({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
        <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} tickLine={false} label={{ value: "Epoch", position: "insideBottom", offset: -1, style: { fontSize: 9, fill: "#64748b" } }} />
        <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "11px" }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "10px", color: "#94a3b8", paddingTop: "4px" }} />
        <Line type="monotone" name="Train Loss" dataKey="train" stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" name="Val Loss" dataKey="val" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RadarViz({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#1e293b" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 10 }} />
        <Radar name="Score" dataKey="score" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: color }} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", fontSize: "11px" }}
          formatter={(v) => [`${v} / 100`, "Score"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Sidebar nav item ───
function NavItem({ model, active, onClick }) {
  const c = ACCENT[model.accent];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 cursor-pointer ${
        active ? `${c.bg} ${c.border} border` : "hover:bg-slate-900/60 border border-transparent"
      }`}
    >
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black font-mono border ${c.bg} ${c.border} ${c.text} shrink-0`}>
        {model.tag}
      </span>
      <div className="min-w-0">
        <p className={`text-xs font-semibold truncate ${active ? c.text : "text-slate-300"}`}>{model.label}</p>
        <p className="text-[9px] text-slate-500 truncate">{model.type.split("—")[0].trim()}</p>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════
export function ModelMetrics() {
  const [activeId, setActiveId] = useState("lstm");
  const [tab, setTab] = useState("overview");

  const model = MODELS.find((m) => m.id === activeId);
  const c = ACCENT[model.accent];

  const TABS = ["overview", "metrics", "architecture", "training curve", "radar"];

  return (
    <div className="flex h-full overflow-hidden bg-[#0B0F19]">

      {/* ── Left Sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-slate-900 bg-slate-950/40 backdrop-blur-md hidden lg:flex flex-col overflow-y-auto">
        <div className="px-5 pt-6 pb-4 border-b border-slate-900">
          <p className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase">DL MODEL REGISTRY</p>
          <p className="text-xs text-slate-400 mt-1">5 production models</p>
        </div>

        <nav className="p-3 space-y-1.5 flex-1">
          {MODELS.map((m) => (
            <NavItem
              key={m.id}
              model={m}
              active={activeId === m.id}
              onClick={() => { setActiveId(m.id); setTab("overview"); }}
            />
          ))}
        </nav>

        {/* Summary bar chart */}
        <div className="p-4 border-t border-slate-900 space-y-2">
          <p className="text-[9px] font-mono font-bold text-slate-500 uppercase">Model R² / Accuracy</p>
          <div className="w-full h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "LSTM", score: 97.1 },
                  { name: "AE", score: 90.0 },
                  { name: "REC", score: 96.2 },
                  { name: "MLP", score: 98.8 },
                  { name: "GNN", score: 96.3 },
                ]}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                <YAxis domain={[85, 100]} stroke="#64748b" fontSize={8} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "10px" }}
                  formatter={(v) => [`${v}%`, "Score"]}
                />
                <Bar dataKey="score" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black font-mono border-2 ${c.bg} ${c.border} ${c.text}`}>
                {model.tag}
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-white leading-tight">{model.label}</h1>
                <p className="text-xs text-slate-400">{model.type}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{model.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge color={model.statusColor}>{model.status}</Badge>
            <span className="text-[10px] font-mono text-slate-500">{model.framework}</span>
          </div>
        </div>

        {/* ── Info Chips ── */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Saved Model", value: model.savedModel },
            { label: "Scaler", value: model.scaler },
            { label: "Total Params", value: model.totalParams },
            { label: "Trainable", value: model.trainable },
          ].map((chip) => (
            <div key={chip.label} className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">{chip.label}:</span>
              <span className="text-[11px] font-mono text-slate-300">{chip.value}</span>
            </div>
          ))}
        </div>

        {/* ── Task Banner ── */}
        <div className={`p-4 rounded-xl border ${c.bg} ${c.border} flex items-start gap-3`}>
          <span className={`text-sm font-black ${c.text} shrink-0`}>⚙</span>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-0.5">Model Task</p>
            <p className={`text-sm font-semibold ${c.text}`}>{model.task}</p>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                tab === t
                  ? `${c.bg} ${c.text} border ${c.border}`
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ════════════ OVERVIEW TAB ════════════ */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Hyperparameters */}
            <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Hyperparameters & Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 font-mono text-xs divide-y divide-slate-800/50">
                {Object.entries(model.hyperparams).map(([key, val], i) => (
                  <div key={key} className="flex items-baseline justify-between py-2.5 px-1 hover:bg-slate-800/20 rounded transition">
                    <span className="text-slate-500 text-[11px] mr-4 shrink-0">{key}</span>
                    <span className={`${c.text} text-right text-[11px] font-bold`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-4">Key Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {Object.entries(model.metrics).map(([key, m]) => (
                  <MetricCard key={key} label={key} value={m.value} sublabel={m.label} dir={m.dir} good={m.good} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ METRICS TAB ════════════ */}
        {tab === "metrics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(model.metrics).map(([key, m]) => (
                <div key={key} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-300">{key}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.label}</p>
                    </div>
                    {m.good !== null && (
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        m.good
                          ? "text-emerald-400 border-emerald-500/30 bg-emerald-950/20"
                          : "text-rose-400 border-rose-500/30 bg-rose-950/20"
                      }`}>
                        {m.good ? "OPTIMAL" : "REVIEW"}
                      </span>
                    )}
                  </div>
                  <p className={`text-4xl font-black ${c.text}`}>{m.value}</p>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase">
                    <span>Target:</span>
                    <span className="text-slate-400">{m.dir === "lower" ? "↓ Lower is better" : m.dir === "higher" ? "↑ Higher is better" : "— Informational"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ ARCHITECTURE TAB ════════════ */}
        {tab === "architecture" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
              <h3 className="text-sm font-bold text-slate-200 mb-4">Layer Stack</h3>
              <table className="w-full text-xs font-mono min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["#", "Layer", "Output Shape", "Parameters", "Note"].map((h) => (
                      <th key={h} className="text-left text-[9px] text-slate-500 uppercase font-bold py-2 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {model.architecture.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20 transition">
                      <td className="py-2.5 pr-6 text-slate-600">{i}</td>
                      <td className={`py-2.5 pr-6 font-bold ${c.text}`}>{row.layer}</td>
                      <td className="py-2.5 pr-6 text-slate-300">{row.shape}</td>
                      <td className="py-2.5 pr-6 text-slate-400">{row.params}</td>
                      <td className="py-2.5 text-slate-500">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-700">
                    <td colSpan={3} className="pt-3 text-slate-500 text-[10px]">Total / Trainable Parameters</td>
                    <td colSpan={2} className={`pt-3 font-black ${c.text}`}>{model.totalParams} / {model.trainable}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Visual pipeline */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 mb-4">Layer Flow</h3>
              <div className="flex flex-wrap items-center gap-2">
                {model.architecture.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`px-3 py-2 rounded-lg border text-[10px] font-mono font-bold ${c.bg} ${c.border} ${c.text} whitespace-nowrap`}>
                      {row.layer}
                      <div className="text-slate-500 font-normal text-[9px] mt-0.5">{row.shape}</div>
                    </div>
                    {i < model.architecture.length - 1 && (
                      <span className="text-slate-600 text-lg">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ TRAINING CURVE TAB ════════════ */}
        {tab === "training curve" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-200">Training vs Validation Loss</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Loss metric: <span className={`font-mono font-bold ${c.text}`}>{model.hyperparams.Loss}</span> · Epochs: <span className={`font-mono font-bold ${c.text}`}>{model.hyperparams.Epochs}</span>
                </p>
              </div>
              <div className="w-full h-72">
                <LossChart data={model.lossHistory} color={model.color} />
              </div>
            </div>

            {/* epoch table */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
              <h3 className="text-sm font-bold text-slate-200 mb-4">Epoch-by-Epoch Log</h3>
              <table className="w-full text-xs font-mono min-w-[380px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["Epoch", "Train Loss", "Val Loss", "Δ Val", "Status"].map((h) => (
                      <th key={h} className="text-left text-[9px] text-slate-500 uppercase font-bold py-2 pr-8">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {model.lossHistory.map((row, i) => {
                    const prev = model.lossHistory[i - 1];
                    const delta = prev ? row.val - prev.val : null;
                    const improving = delta !== null && delta < 0;
                    return (
                      <tr key={i} className="hover:bg-slate-800/20 transition">
                        <td className="py-2.5 pr-8 text-slate-400">{row.epoch}</td>
                        <td className={`py-2.5 pr-8 ${c.text} font-bold`}>{row.train.toFixed(4)}</td>
                        <td className="py-2.5 pr-8 text-slate-300">{row.val.toFixed(4)}</td>
                        <td className={`py-2.5 pr-8 font-bold ${delta === null ? "text-slate-600" : improving ? "text-emerald-400" : "text-rose-400"}`}>
                          {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(4)}`}
                        </td>
                        <td className={`py-2.5 text-[10px] font-bold ${delta === null ? "text-slate-500" : improving ? "text-emerald-400" : "text-rose-400"}`}>
                          {delta === null ? "BASELINE" : improving ? "↓ IMPROVING" : "↑ OVERFIT"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════ RADAR TAB ════════════ */}
        {tab === "radar" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 mb-1">Performance Radar</h3>
              <p className="text-xs text-slate-500 mb-4">Composite performance across key evaluation dimensions (score / 100)</p>
              <div className="w-full h-72">
                <RadarViz data={model.radarData} color={model.color} />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Dimension Breakdown</h3>
              {model.radarData.map((d) => (
                <div key={d.metric} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">{d.metric}</span>
                    <span className={`font-mono font-bold ${c.text}`}>{d.score} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${d.score}%`, background: model.color }}
                    />
                  </div>
                </div>
              ))}

              {/* All-models comparison */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-3">All Models — Best Metric</p>
                <div className="space-y-2">
                  {MODELS.map((m) => {
                    const ca = ACCENT[m.accent];
                    const best = Object.values(m.metrics)[0].value;
                    return (
                      <div
                        key={m.id}
                        onClick={() => { setActiveId(m.id); setTab("overview"); }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition ${m.id === activeId ? `${ca.bg} border ${ca.border}` : "hover:bg-slate-800/40"}`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black font-mono border ${ca.bg} ${ca.border} ${ca.text} shrink-0`}>
                          {m.tag}
                        </span>
                        <span className="text-xs text-slate-300 flex-1 truncate">{m.label}</span>
                        <span className={`text-[11px] font-mono font-bold ${ca.text}`}>{best}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModelMetrics;


import { useState, useEffect, useRef, useMemo } from "react";
import { gnnService } from "../services/gnnService";
import { Loader } from "../components/common/Loader";

const RISK_COLORS = {
  low: { bg: "#10b981", border: "#059669", label: "Low Risk" },
  warning: { bg: "#f59e0b", border: "#d97706", label: "Warning" },
  critical: { bg: "#ef4444", border: "#dc2626", label: "Critical" },
};

function GraphCanvas({ nodes, edges, predictions, selectedNodeId, onSelectNode }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Build prediction lookup
  const predMap = useMemo(() => {
    const map = {};
    (predictions || []).forEach((p) => {
      map[p.householdId] = p;
    });
    return map;
  }, [predictions]);

  // Compute canvas node positions in a circle layout
  const WIDTH = 700;
  const HEIGHT = 460;
  const CX = WIDTH / 2;
  const CY = HEIGHT / 2;
  const R = Math.min(CX, CY) - 80;

  const nodePositions = useMemo(() => {
    return nodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, nodes.length) - Math.PI / 2;
      return {
        ...n,
        x: CX + R * Math.cos(angle),
        y: CY + R * Math.sin(angle),
      };
    });
  }, [nodes, CX, CY, R]);

  const posMap = useMemo(() => {
    const map = {};
    nodePositions.forEach((n) => { map[n.id] = n; });
    return map;
  }, [nodePositions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw edges
    edges.forEach((edge) => {
      const src = posMap[edge.source];
      const tgt = posMap[edge.target];
      if (!src || !tgt) return;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.strokeStyle = `rgba(100, 116, 139, ${(edge.weight || 0.5) * 0.4})`;
      ctx.lineWidth = edge.weight > 0.8 ? 1.5 : 0.8;
      ctx.stroke();
    });

    // Draw nodes
    nodePositions.forEach((node) => {
      const pred = predMap[node.id];
      const risk = pred?.gridRiskLevel || "low";
      const color = RISK_COLORS[risk];
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNode === node.id;
      const radius = isSelected ? 18 : isHovered ? 16 : 14;

      // Selection Ring Glow
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 12, 0, 2 * Math.PI);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Node Glow
      const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius + 8);
      grd.addColorStop(0, color.bg + "60");
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 8, 0, 2 * Math.PI);
      ctx.fill();

      // Outer ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected ? "#38bdf8" : color.border;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Fill
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius - 2, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? "#0284c7" + "40" : color.bg + "30";
      ctx.fill();

      // Renewable dot (solar)
      if (node.renewable) {
        ctx.beginPath();
        ctx.arc(node.x + radius - 4, node.y - radius + 4, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#10b981";
        ctx.fill();
      }

      // Label
      ctx.font = isSelected || isHovered ? "bold 10px monospace" : "9px monospace";
      ctx.fillStyle = isSelected ? "#38bdf8" : "#e2e8f0";
      ctx.textAlign = "center";
      ctx.fillText(node.id, node.x, node.y + radius + 14);

      // Energy label
      if (pred) {
        ctx.font = "8px monospace";
        ctx.fillStyle = color.bg;
        ctx.fillText(`${pred.predictedEnergyKwh} kWh`, node.x, node.y + radius + 25);
      }
    });
  }, [edges, hoveredNode, nodePositions, posMap, predMap, selectedNodeId]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (WIDTH / rect.width);
    const my = (e.clientY - rect.top) * (HEIGHT / rect.height);

    let found = null;
    nodePositions.forEach((n) => {
      const dist = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2);
      if (dist < 22) found = n.id;
    });
    setHoveredNode(found);
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (WIDTH / rect.width);
    const my = (e.clientY - rect.top) * (HEIGHT / rect.height);

    nodePositions.forEach((n) => {
      const dist = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2);
      if (dist < 22 && onSelectNode) {
        onSelectNode(n.id);
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={() => setHoveredNode(null)}
      className="w-full h-auto rounded-xl"
      style={{ cursor: hoveredNode ? "pointer" : "default" }}
    />
  );
}

export function GNNGraph() {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [editableNodes, setEditableNodes] = useState([]);
  const [editableEdges, setEditableEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isCustomVerified, setIsCustomVerified] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [topo, preds] = await Promise.all([
          gnnService.getTopology(),
          gnnService.getPredictions(),
        ]);
        setPredictions(preds);
        const initNodes = (topo?.nodes || []).map((n) => ({
          ...n,
          energyKwh: n.energyKwh || 12.5,
          peakKw: n.peakKw || 4.0,
          occupants: n.occupants || 2,
          renewable: !!n.renewable,
        }));
        setEditableNodes(initNodes);
        setEditableEdges(topo?.edges || []);
        if (initNodes.length > 0) {
          setSelectedNodeId(initNodes[0].id);
        }
      } catch {
        setError("Failed to load GNN graph data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const selectedNode = editableNodes.find((n) => n.id === selectedNodeId);

  const handleUpdateSelectedNode = (field, value) => {
    if (!selectedNodeId) return;
    setEditableNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, [field]: value } : n))
    );
  };

  const handleAddNode = () => {
    const newId = `H_CUSTOM_${Math.floor(100 + Math.random() * 900)}`;
    const newNode = {
      id: newId,
      type: "household",
      energyKwh: 15.0,
      peakKw: 4.5,
      occupants: 3,
      renewable: false,
    };
    const updated = [...editableNodes, newNode];
    setEditableNodes(updated);
    setSelectedNodeId(newId);
    
    // Add dynamic connections to nearest existing nodes
    if (updated.length > 1) {
      const prevId = updated[updated.length - 2].id;
      setEditableEdges((edges) => [...edges, { source: newId, target: prevId, weight: 1.0 }]);
    }
  };

  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    const updated = editableNodes.filter((n) => n.id !== selectedNodeId);
    setEditableNodes(updated);
    setEditableEdges((edges) =>
      edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    );
    setSelectedNodeId(updated.length > 0 ? updated[0].id : null);
  };

  const handleResetGraph = async () => {
    setLoading(true);
    setIsCustomVerified(false);
    try {
      const [topo, preds] = await Promise.all([
        gnnService.getTopology(),
        gnnService.getPredictions(),
      ]);
      setPredictions(preds);
      const initNodes = (topo?.nodes || []).map((n) => ({
        ...n,
        energyKwh: n.energyKwh || 12.5,
        peakKw: n.peakKw || 4.0,
        occupants: n.occupants || 2,
        renewable: !!n.renewable,
      }));
      setEditableNodes(initNodes);
      setEditableEdges(topo?.edges || []);
      if (initNodes.length > 0) setSelectedNodeId(initNodes[0].id);
    } catch {
      setError("Failed to reset graph.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCustomGraph = async () => {
    setVerifying(true);
    try {
      const customRes = await gnnService.verifyCustomGraph(editableNodes);
      setPredictions(customRes);
      if (customRes.edges) {
        setEditableEdges(customRes.edges);
      }
      setIsCustomVerified(true);
    } catch (e) {
      console.error(e);
      alert("Failed to run custom GNN inference verification.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader />
          <p className="text-slate-400 text-sm">Building Energy Graph Neural Network…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <p className="text-rose-400">{error}</p>
      </div>
    );
  }

  const preds = predictions?.nodePredictions || [];
  const critical = preds.filter((p) => p.gridRiskLevel === "critical").length;
  const warning = preds.filter((p) => p.gridRiskLevel === "warning").length;
  const safe = preds.filter((p) => p.gridRiskLevel === "low").length;

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#0B0F19]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Grid Neural Network Graph
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Spatial energy topology — edit nodes & run self-verified GNN graph inference
          </p>
        </div>
        
        {/* Verification Trigger CTA */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetGraph}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
          >
            Reset Default Graph
          </button>
          <button
            onClick={handleVerifyCustomGraph}
            disabled={verifying}
            className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-300 hover:opacity-90 rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2"
          >
            {verifying ? (
              <>
                <Loader size="sm" />
                <span>Running GNN Inference…</span>
              </>
            ) : (
              <>
                <span>⚡ Verify & Run GNN Inference</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verified Scenario Alert Banner */}
      {isCustomVerified && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <div>
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Custom User Graph Verification Active</h4>
              <p className="text-[11px] text-slate-300">
                GNN inference completed for {editableNodes.length} customized household nodes across local network topology.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-900/60 px-3 py-1 rounded-full border border-cyan-400/30">
            {predictions?.modelType}
          </span>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Graph Nodes</span>
          <div className="text-3xl font-extrabold text-white mt-2">{editableNodes.length}</div>
          <span className="text-[10px] text-slate-500">Household network members</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Grid Edges</span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2">{editableEdges.length}</div>
          <span className="text-[10px] text-slate-500">Local feeder connections</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Neighborhood kWh</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {predictions?.totalNeighborhoodEnergyKwh?.toFixed(1) || 0}
          </div>
          <span className="text-[10px] text-slate-500">GNN-predicted energy draw</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Peak kW</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">
            {predictions?.totalNeighborhoodPeakKw?.toFixed(1) || 0}
          </div>
          <span className="text-[10px] text-slate-500">GNN-predicted peak load</span>
        </div>
      </div>

      {/* Risk Summary Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2 bg-rose-950/20 border border-rose-500/20 px-4 py-2 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-semibold text-rose-400">{critical} Critical Nodes</span>
          </div>
          <div className="flex items-center space-x-2 bg-amber-950/20 border border-amber-500/20 px-4 py-2 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-400">{warning} Warning Nodes</span>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-950/20 border border-emerald-500/20 px-4 py-2 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-400">{safe} Safe Nodes</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddNode}
            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 rounded-xl border border-emerald-500/30 transition flex items-center space-x-1.5"
          >
            <span>+ Add Household Node</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas + Node Editor Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Canvas Visualizer */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-300">Interactive Household Topology Canvas</h4>
              <p className="text-xs text-slate-500">Click any node on the canvas to inspect, modify, or test parameters</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-500/20 px-3 py-1 rounded-full">
              {predictions?.modelType}
            </span>
          </div>
          <GraphCanvas
            nodes={editableNodes}
            edges={editableEdges}
            predictions={preds}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </div>

        {/* Node Customization & Parameter Editor */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Node Parameter Editor</h4>
              <p className="text-[11px] text-slate-400">Configure parameters for selected node</p>
            </div>
            {selectedNode && (
              <button
                onClick={handleDeleteNode}
                className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-500/20"
              >
                Delete Node
              </button>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Household Node ID</label>
                <input
                  type="text"
                  value={selectedNode.id}
                  onChange={(e) => handleUpdateSelectedNode("id", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Daily Usage (kWh)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    value={selectedNode.energyKwh}
                    onChange={(e) => handleUpdateSelectedNode("energyKwh", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Peak Draw (kW)</label>
                  <input
                    type="number"
                    step="0.2"
                    min="0.5"
                    max="30"
                    value={selectedNode.peakKw}
                    onChange={(e) => handleUpdateSelectedNode("peakKw", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Occupants Count</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={selectedNode.occupants}
                  onChange={(e) => handleUpdateSelectedNode("occupants", parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Renewable Solar Grid</div>
                  <div className="text-[10px] text-slate-400">Reduces peak load risk by 15%</div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedNode.renewable}
                  onChange={(e) => handleUpdateSelectedNode("renewable", e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleVerifyCustomGraph}
                  disabled={verifying}
                  className="w-full py-2.5 text-xs font-bold text-slate-900 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-xl shadow transition"
                >
                  {verifying ? "Verifying..." : "⚡ Run Inference on This Topology"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No node selected. Click a node on the canvas to edit.
            </div>
          )}
        </div>
      </div>

      {/* Node Prediction & Verification Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-semibold text-slate-300">Verified GNN Predictions per Node</h4>
          <span className="text-[10px] text-slate-400">Total {preds.length} verified household nodes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="pb-3 text-slate-400 font-mono uppercase text-[10px]">Household ID</th>
                <th className="pb-3 text-slate-400 font-mono uppercase text-[10px]">Occupants</th>
                <th className="pb-3 text-slate-400 font-mono uppercase text-[10px]">Renewable</th>
                <th className="pb-3 text-slate-400 font-mono uppercase text-[10px]">Predicted Energy</th>
                <th className="pb-3 text-slate-400 font-mono uppercase text-[10px]">Peak Draw</th>
                <th className="pb-3 text-slate-400 font-mono uppercase text-[10px]">GNN Grid Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {preds.map((p) => {
                const isSelected = p.householdId === selectedNodeId;
                return (
                  <tr
                    key={p.householdId}
                    onClick={() => setSelectedNodeId(p.householdId)}
                    className={`cursor-pointer transition ${
                      isSelected ? "bg-slate-800/80 border-l-4 border-cyan-400" : "hover:bg-slate-800/30"
                    }`}
                  >
                    <td className="py-2.5 font-mono text-slate-200">{p.householdId}</td>
                    <td className="py-2.5 text-slate-400">{p.occupants || 2} occupants</td>
                    <td className="py-2.5">
                      {p.renewable ? (
                        <span className="text-emerald-400 font-semibold text-[10px]">🟢 Solar Connected</span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">⚪ Grid Only</span>
                      )}
                    </td>
                    <td className="py-2.5 font-mono text-emerald-400">{p.predictedEnergyKwh} kWh</td>
                    <td className="py-2.5 font-mono text-amber-400">{p.predictedPeakKw} kW</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.gridRiskLevel === "critical"
                          ? "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                          : p.gridRiskLevel === "warning"
                          ? "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {RISK_COLORS[p.gridRiskLevel]?.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GNNGraph;

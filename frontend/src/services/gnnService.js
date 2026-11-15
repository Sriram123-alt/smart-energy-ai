import apiClient from "./apiClient";

export const gnnService = {
  getTopology: async () => {
    try {
      const res = await apiClient.get("/gnn/topology");
      return res.data;
    } catch (e) {
      console.warn("GNN topology API unavailable, using mock", e);
      // Mock graph with 10 nodes and edges
      const nodes = Array.from({ length: 10 }, (_, i) => ({
        id: `H1000${i}`,
        index: i,
        type: "household",
        energyKwh: parseFloat((5 + Math.random() * 15).toFixed(2)),
        occupants: Math.floor(1 + Math.random() * 4),
        renewable: Math.random() > 0.4,
        peakKw: parseFloat((1.5 + Math.random() * 5).toFixed(2)),
      }));
      const edges = [];
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          if (Math.floor(i / 5) === Math.floor(j / 5)) {
            edges.push({ source: nodes[i].id, target: nodes[j].id, weight: 1.0 });
          }
        }
      }
      return { status: "mock", numNodes: nodes.length, numEdges: edges.length, nodes, edges };
    }
  },

  getPredictions: async () => {
    try {
      const res = await apiClient.get("/gnn/predict");
      return res.data;
    } catch (e) {
      console.warn("GNN predict API unavailable, using mock", e);
      return {
        status: "mock",
        modelType: "Graph Neural Network (GCN)",
        numNodes: 10,
        totalNeighborhoodEnergyKwh: 87.4,
        totalNeighborhoodPeakKw: 32.1,
        nodePredictions: Array.from({ length: 10 }, (_, i) => ({
          householdId: `H1000${i}`,
          predictedEnergyKwh: parseFloat((5 + Math.random() * 15).toFixed(2)),
          predictedPeakKw: parseFloat((1.5 + Math.random() * 5).toFixed(2)),
          gridRiskLevel: ["low", "warning", "critical"][Math.floor(Math.random() * 3)],
        })),
      };
    }
  },

  verifyCustomGraph: async (customNodes) => {
    try {
      const res = await apiClient.post("/gnn/custom-verify", { nodes: customNodes });
      return res.data;
    } catch (e) {
      console.warn("GNN custom-verify API unavailable, using mock", e);
      let totalE = 0;
      let totalP = 0;
      const preds = customNodes.map((n) => {
        const energy = parseFloat(n.energyKwh || 12);
        let peak = parseFloat(n.peakKw || energy * 0.35);
        if (n.renewable) peak *= 0.85;
        totalE += energy;
        totalP += peak;
        const risk = peak > 6.0 ? "critical" : peak > 3.5 ? "warning" : "low";
        return {
          householdId: n.id,
          predictedEnergyKwh: parseFloat(energy.toFixed(2)),
          predictedPeakKw: parseFloat(peak.toFixed(2)),
          gridRiskLevel: risk,
          renewable: !!n.renewable,
          occupants: parseInt(n.occupants || 2),
        };
      });
      return {
        status: "mock",
        modelType: "Custom GCN Simulator (Fallback)",
        numNodes: customNodes.length,
        totalNeighborhoodEnergyKwh: parseFloat(totalE.toFixed(2)),
        totalNeighborhoodPeakKw: parseFloat(totalP.toFixed(2)),
        nodePredictions: preds,
      };
    }
  },
};

export default gnnService;


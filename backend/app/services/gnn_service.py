import os
import pickle
import keras
import pandas as pd
import numpy as np
from app.config.settings import settings
from app.dl.preprocessing.graph_builder import build_energy_graph
from app.dl.models.gnn_energy_graph import GraphConvLayer

class GNNService:
    @staticmethod
    def get_graph_topology() -> dict:
        meta_path = os.path.join(settings.SAVED_MODELS_DIR, "graph_meta.pkl")
        
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "rb") as f:
                    graph_meta = pickle.load(f)
                return {
                    "status": "success",
                    "numNodes": graph_meta["numNodes"],
                    "numEdges": graph_meta["numEdges"],
                    "nodes": graph_meta["nodeLabels"],
                    "edges": graph_meta["edgeList"][:100]  # Top 100 spatial edges for UI graph renderer
                }
            except Exception as e:
                pass

        # Fallback build graph metadata dynamically
        _, _, _, graph_meta = build_energy_graph()
        return {
            "status": "success",
            "numNodes": graph_meta["numNodes"],
            "numEdges": graph_meta["numEdges"],
            "nodes": graph_meta["nodeLabels"],
            "edges": graph_meta["edgeList"][:100]
        }

    @staticmethod
    def get_gnn_predictions() -> dict:
        model_path = os.path.join(settings.SAVED_MODELS_DIR, "gnn_energy_model.keras")
        meta_path = os.path.join(settings.SAVED_MODELS_DIR, "graph_meta.pkl")

        # Build dynamic graph features
        X_scaled, A_norm, _, graph_meta = build_energy_graph()
        
        if os.path.exists(model_path):
            try:
                model = keras.models.load_model(model_path, custom_objects={"GraphConvLayer": GraphConvLayer})
                raw_preds = model.predict({"node_features": X_scaled, "norm_adj": A_norm}, batch_size=len(X_scaled), verbose=0)

                
                target_scaler = graph_meta["targetScaler"]
                preds_unscaled = target_scaler.inverse_transform(raw_preds)
                
                results = []
                total_energy = 0.0
                total_peak = 0.0
                
                for idx, h_id in enumerate(graph_meta["householdIds"]):
                    raw_energy = float(preds_unscaled[idx, 0])
                    raw_peak = float(preds_unscaled[idx, 1])

                    # Clip to realistic physical boundaries
                    pred_energy = float(np.clip(raw_energy if not np.isnan(raw_energy) else 10.0, 1.0, 50.0))
                    pred_peak = float(np.clip(raw_peak if not np.isnan(raw_peak) else 3.0, 0.5, 12.0))
                    
                    total_energy += pred_energy
                    total_peak += pred_peak
                    
                    # Risk score based on peak draw relative to average (3.0 kW)
                    risk_level = "low"
                    if pred_peak > 6.0:
                        risk_level = "critical"
                    elif pred_peak > 3.5:
                        risk_level = "warning"

                    results.append({
                        "householdId": h_id,
                        "predictedEnergyKwh": round(pred_energy, 2),
                        "predictedPeakKw": round(pred_peak, 2),
                        "gridRiskLevel": risk_level
                    })


                return {
                    "status": "success",
                    "modelType": "Graph Neural Network (GCN)",
                    "numNodes": len(results),
                    "totalNeighborhoodEnergyKwh": round(total_energy, 2),
                    "totalNeighborhoodPeakKw": round(total_peak, 2),
                    "nodePredictions": results[:25] # Return top 25 household nodes
                }
            except Exception as e:
                return {"status": "error", "message": f"Error running GNN inference: {str(e)}"}

    @staticmethod
    def verify_custom_nodes(custom_nodes: list) -> dict:
        """
        Runs real-time GNN inference on a user-modified set of nodes.
        """
        if not custom_nodes:
            return {"status": "error", "message": "No nodes provided for custom verification."}

        model_path = os.path.join(settings.SAVED_MODELS_DIR, "gnn_energy_model.keras")
        meta_path = os.path.join(settings.SAVED_MODELS_DIR, "graph_meta.pkl")

        feature_scaler = None
        target_scaler = None
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "rb") as f:
                    meta = pickle.load(f)
                    feature_scaler = meta.get("featureScaler")
                    target_scaler = meta.get("targetScaler")
            except Exception:
                pass

        if feature_scaler is None or target_scaler is None:
            _, _, _, meta = build_energy_graph()
            feature_scaler = meta["featureScaler"]
            target_scaler = meta["targetScaler"]

        node_features = []
        household_ids = []
        n_custom = len(custom_nodes)

        for n in custom_nodes:
            h_id = str(n.get("id", f"H{np.random.randint(10000, 99999)}"))
            household_ids.append(h_id)

            energy = float(n.get("energyKwh", 12.0))
            occupants = float(n.get("occupants", 2))
            temp = float(n.get("temp", 68.0))
            ren_val = 1.0 if n.get("renewable", False) else 0.0
            peak_kw = float(n.get("peakKw", energy * 0.35))

            feat = [energy, occupants, temp, ren_val, peak_kw, 1.2, 4.20, 4.15]
            node_features.append(feat)

        X = np.array(node_features, dtype=np.float32)
        X_scaled = feature_scaler.transform(X)

        # Build Spatial Adjacency Matrix A
        A = np.eye(n_custom, dtype=np.float32)
        edge_list = []
        cluster_size = 5

        for i in range(n_custom):
            for j in range(i + 1, n_custom):
                same_cluster = (i // cluster_size) == (j // cluster_size)
                feat_sim = float(np.exp(-np.linalg.norm(X[i, :2] - X[j, :2]) / 10.0))
                if same_cluster or feat_sim > 0.65:
                    weight = 1.0 if same_cluster else round(feat_sim, 3)
                    A[i, j] = weight
                    A[j, i] = weight
                    edge_list.append({"source": household_ids[i], "target": household_ids[j], "weight": weight})

        # Compute Normalized Adjacency Matrix \tilde{A} = D^{-1/2} A D^{-1/2}
        D = np.diag(np.sum(A, axis=1))
        D_inv_sqrt = np.power(np.maximum(1e-5, D), -0.5)
        A_norm = D_inv_sqrt @ A @ D_inv_sqrt

        results = []
        total_energy = 0.0
        total_peak = 0.0

        if os.path.exists(model_path):
            try:
                model = keras.models.load_model(model_path, custom_objects={"GraphConvLayer": GraphConvLayer})
                raw_preds = model.predict({"node_features": X_scaled, "norm_adj": A_norm}, batch_size=n_custom, verbose=0)
                preds_unscaled = target_scaler.inverse_transform(raw_preds)

                for idx, h_id in enumerate(household_ids):
                    raw_energy = float(preds_unscaled[idx, 0])
                    raw_peak = float(preds_unscaled[idx, 1])

                    pred_energy = float(np.clip(raw_energy if not np.isnan(raw_energy) else X[idx, 0], 1.0, 60.0))
                    pred_peak = float(np.clip(raw_peak if not np.isnan(raw_peak) else X[idx, 4], 0.5, 15.0))

                    if custom_nodes[idx].get("renewable", False):
                        pred_peak *= 0.85

                    total_energy += pred_energy
                    total_peak += pred_peak

                    risk_level = "low"
                    if pred_peak > 6.0:
                        risk_level = "critical"
                    elif pred_peak > 3.5:
                        risk_level = "warning"

                    results.append({
                        "householdId": h_id,
                        "predictedEnergyKwh": round(pred_energy, 2),
                        "predictedPeakKw": round(pred_peak, 2),
                        "gridRiskLevel": risk_level,
                        "renewable": custom_nodes[idx].get("renewable", False),
                        "occupants": int(custom_nodes[idx].get("occupants", 2)),
                        "energyKwh": round(float(custom_nodes[idx].get("energyKwh", 12.0)), 2)
                    })

                return {
                    "status": "success",
                    "modelType": "Custom Graph Convolutional Network (GCN)",
                    "numNodes": len(results),
                    "numEdges": len(edge_list),
                    "totalNeighborhoodEnergyKwh": round(total_energy, 2),
                    "totalNeighborhoodPeakKw": round(total_peak, 2),
                    "nodePredictions": results,
                    "edges": edge_list[:100]
                }
            except Exception as e:
                pass

        for idx, h_id in enumerate(household_ids):
            base_e = float(X[idx, 0])
            base_p = float(X[idx, 4])
            if custom_nodes[idx].get("renewable", False):
                base_p *= 0.85
            total_energy += base_e
            total_peak += base_p
            risk_level = "critical" if base_p > 6.0 else ("warning" if base_p > 3.5 else "low")
            results.append({
                "householdId": h_id,
                "predictedEnergyKwh": round(base_e, 2),
                "predictedPeakKw": round(base_p, 2),
                "gridRiskLevel": risk_level,
                "renewable": custom_nodes[idx].get("renewable", False),
                "occupants": int(custom_nodes[idx].get("occupants", 2)),
                "energyKwh": round(base_e, 2)
            })

        return {
            "status": "success",
            "modelType": "Custom Heuristic Graph Predictor",
            "numNodes": len(results),
            "numEdges": len(edge_list),
            "totalNeighborhoodEnergyKwh": round(total_energy, 2),
            "totalNeighborhoodPeakKw": round(total_peak, 2),
            "nodePredictions": results,
            "edges": edge_list[:100]
        }


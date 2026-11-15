import os
import pickle
from app.config.settings import settings
from app.dl.preprocessing.graph_builder import build_energy_graph
from app.dl.models.gnn_energy_graph import build_gnn_model

def train_gnn():
    print("Building Heterogeneous Energy Graph from all datasets...")
    X_scaled, A_norm, Y_scaled, graph_meta = build_energy_graph()

    num_nodes, feature_dim = X_scaled.shape
    print(f"Graph initialized: {num_nodes} nodes, {feature_dim} features per node, {graph_meta['numEdges']} spatial grid edges.")

    # Build GNN Model
    model = build_gnn_model(input_feature_dim=feature_dim, num_nodes=num_nodes)

    # Train GNN Model
    print("Training Graph Neural Network (GNN)...")
    model.fit(
        x={"node_features": X_scaled, "norm_adj": A_norm},
        y=Y_scaled,
        epochs=15,
        batch_size=num_nodes,
        verbose=0
    )

    # Save trained GNN model
    os.makedirs(settings.SAVED_MODELS_DIR, exist_ok=True)
    model_path = os.path.join(settings.SAVED_MODELS_DIR, "gnn_energy_model.keras")
    model.save(model_path)
    print(f"GNN Model training complete and saved at: {model_path}")

    # Save graph metadata & scalers
    meta_path = os.path.join(settings.SAVED_MODELS_DIR, "graph_meta.pkl")
    with open(meta_path, "wb") as f:
        pickle.dump(graph_meta, f)
    print(f"Graph metadata saved at: {meta_path}")

if __name__ == "__main__":
    train_gnn()

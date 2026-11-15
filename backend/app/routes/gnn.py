from fastapi import APIRouter
from app.services.gnn_service import GNNService

router = APIRouter(prefix="/gnn", tags=["gnn"])

@router.get("/topology")
def get_gnn_topology():
    """
    Returns spatial energy graph nodes, edge list, and cluster metadata connecting households, appliances, and grid carbon nodes.
    """
    return GNNService.get_graph_topology()

@router.get("/predict")
def get_gnn_predictions():
    """
    Runs Graph Neural Network (GNN) inference across the energy graph and returns household load forecasts and peak grid risk.
    """
    return GNNService.get_gnn_predictions()

@router.post("/custom-verify")
def verify_custom_gnn(payload: dict):
    """
    Runs real-time GNN graph inference on user-modified node topologies and parameters.
    """
    custom_nodes = payload.get("nodes", [])
    return GNNService.verify_custom_nodes(custom_nodes)


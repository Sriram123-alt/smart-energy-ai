from pydantic import BaseModel

class AnomalyOut(BaseModel):
    id: str
    appliance: str
    severity: str
    timestamp: str
    title: str
    description: str
    impact_cost: float
    impact_carbon: float
    resolved: int

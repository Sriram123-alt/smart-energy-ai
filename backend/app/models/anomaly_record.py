"""
Anomaly Record Entity Model
"""
from dataclasses import dataclass
from typing import Optional

@dataclass
class AnomalyRecord:
    id: str
    appliance: str
    severity: str  # "info", "warning", "critical"
    timestamp: str
    title: str
    description: str
    impact_cost: float
    impact_carbon: float
    resolved: int = 0  # 0 for active, 1 for acknowledged/resolved

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "appliance": self.appliance,
            "severity": self.severity,
            "timestamp": self.timestamp,
            "title": self.title,
            "description": self.description,
            "impact_cost": self.impact_cost,
            "impact_carbon": self.impact_carbon,
            "resolved": self.resolved
        }

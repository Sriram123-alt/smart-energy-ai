"""
Forecast Horizon Record Entity Model
"""
from dataclasses import dataclass
from typing import Optional

@dataclass
class ForecastRecord:
    timestamp: str
    predicted_kwh: float
    lower_bound_kwh: float
    upper_bound_kwh: float
    confidence_score: float = 0.95

    def to_dict(self) -> dict:
        return {
            "timestamp": self.timestamp,
            "predictedKwh": round(self.predicted_kwh, 3),
            "lowerBoundKwh": round(self.lower_bound_kwh, 3),
            "upperBoundKwh": round(self.upper_bound_kwh, 3),
            "confidenceScore": round(self.confidence_score, 2)
        }

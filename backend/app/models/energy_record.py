"""
Energy Time-Series Reading Record Entity Model
"""
from dataclasses import dataclass
from typing import Optional

@dataclass
class EnergyRecord:
    timestamp: str
    grid_draw_kwh: float
    solar_generation_kwh: float
    temperature: float
    occupancy_rate: float
    is_anomaly: int = 0

    @property
    def net_draw_kwh(self) -> float:
        return max(0.0, round(self.grid_draw_kwh - self.solar_generation_kwh, 3))

    def to_dict(self) -> dict:
        return {
            "timestamp": self.timestamp,
            "grid_draw_kwh": round(self.grid_draw_kwh, 3),
            "solar_generation_kwh": round(self.solar_generation_kwh, 3),
            "net_draw_kwh": self.net_draw_kwh,
            "temperature": round(self.temperature, 1),
            "occupancy_rate": round(self.occupancy_rate, 2),
            "is_anomaly": self.is_anomaly
        }

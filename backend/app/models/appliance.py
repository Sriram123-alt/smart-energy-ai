"""
Appliance Entity Model
"""
from dataclasses import dataclass
from typing import Optional

@dataclass
class Appliance:
    id: str
    name: str
    category: str
    wattage: int
    quantity: int
    hours: int
    status: int  # 1 for active/on, 0 for off
    location: str
    consumption: int  # wattage * quantity if status == 1 else 0

    @property
    def daily_kwh(self) -> float:
        """Calculates estimated daily kWh draw based on daily operational hours."""
        return round((self.wattage * self.quantity * self.hours) / 1000.0, 3)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "wattage": self.wattage,
            "quantity": self.quantity,
            "hours": self.hours,
            "status": self.status,
            "location": self.location,
            "consumption": self.consumption,
            "dailyKwh": self.daily_kwh
        }

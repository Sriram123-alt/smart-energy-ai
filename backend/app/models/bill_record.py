"""
Billing Record Entity Model
"""
from dataclasses import dataclass
from typing import Optional

@dataclass
class BillRecord:
    month: str
    generation: float
    transmission: float
    taxes: float
    total: float
    service_fee: float = 15.00
    solar_credit: float = 0.0

    @property
    def net_bill(self) -> float:
        return max(0.0, round(self.total - self.solar_credit, 2))

    def to_dict(self) -> dict:
        return {
            "month": self.month,
            "generation": round(self.generation, 2),
            "transmission": round(self.transmission, 2),
            "taxes": round(self.taxes, 2),
            "serviceFee": round(self.service_fee, 2),
            "solarCredit": round(self.solar_credit, 2),
            "total": round(self.total, 2),
            "netBill": self.net_bill
        }

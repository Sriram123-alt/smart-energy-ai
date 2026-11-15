import numpy as np

class BillingService:
    @staticmethod
    def get_monthly_bill_history() -> list:
        # Mock bill history for the cost bar chart (last 6 months)
        return [
            {"month": "Dec", "generation": 45.2, "transmission": 22.0, "taxes": 5.4, "total": 72.6},
            {"month": "Jan", "generation": 48.0, "transmission": 24.5, "taxes": 5.8, "total": 78.3},
            {"month": "Feb", "generation": 42.1, "transmission": 21.0, "taxes": 5.0, "total": 68.1},
            {"month": "Mar", "generation": 35.5, "transmission": 18.2, "taxes": 4.3, "total": 58.0},
            {"month": "Apr", "generation": 31.0, "transmission": 15.0, "taxes": 3.7, "total": 49.7},
            {"month": "May", "generation": 38.4, "transmission": 19.8, "taxes": 4.6, "total": 62.8}
        ]

    @staticmethod
    def calculate_bill_projection(tariff_mode: str, base_rate: float, service_fee: float, appliances_kwh: float) -> dict:
        """
        Calculates estimated cost projections based on selected tariff rate terms
        """
        multiplier = 1.0
        if tariff_mode == "tou":
            # Time-of-use adds peak charges (+30% average increase)
            multiplier = 1.3
        elif tariff_mode == "green":
            # Green tariff discount (-10% rate)
            multiplier = 0.9
            
        active_rate = base_rate * multiplier
        generation_cost = appliances_kwh * active_rate
        transmission_cost = appliances_kwh * 0.05 # standard transmission rate
        taxes = (generation_cost + transmission_cost) * 0.08 # 8% tax
        
        total = generation_cost + transmission_cost + taxes + service_fee
        
        return {
            "generation": round(generation_cost, 2),
            "transmission": round(transmission_cost, 2),
            "taxes": round(taxes, 2),
            "serviceFee": round(service_fee, 2),
            "total": round(total, 2)
        }

"""
AI Optimization Recommendation Record Entity Model
"""
from dataclasses import dataclass
from typing import Optional

@dataclass
class RecommendationRecord:
    id: str
    title: str
    description: str
    category: str  # "HVAC", "Tariff", "EV", "Solar", "Standby"
    savings_monthly: float
    difficulty: str  # "Easy", "Medium", "Hard"
    applied: int = 0  # 0 for pending, 1 for implemented

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "savingsMonthly": round(self.savings_monthly, 2),
            "difficulty": self.difficulty,
            "applied": self.applied
        }

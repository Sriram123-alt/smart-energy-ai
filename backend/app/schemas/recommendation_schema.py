"""
Recommendation Schemas
"""
from typing import List, Optional
from pydantic import BaseModel

class RecommendationOut(BaseModel):
    id: str
    title: str
    description: str
    category: str
    savings_monthly: float
    difficulty: str
    applied: int

class RecommendationToggleResponse(BaseModel):
    success: bool
    rec_id: str
    applied: int
    message: Optional[str] = None

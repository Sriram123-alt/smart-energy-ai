"""
Energy Telemetry & Load Curve Schemas
"""
from typing import List, Optional
from pydantic import BaseModel

class RealtimeMetricsOut(BaseModel):
    currentDrawKw: float
    currentSolarKw: float
    netDrawKw: float
    gridFrequencyHz: float = 60.0
    status: str = "optimal"
    timestamp: str

class TodaySummaryOut(BaseModel):
    totalConsumptionKwh: float
    totalSolarKwh: float
    netGridImportKwh: float
    estimatedCostToday: float
    carbonEmittedKg: float
    carbonSavedKg: float

class HourlyLoadPoint(BaseModel):
    hour: str
    gridDrawKwh: float
    solarGenKwh: float
    netDrawKwh: float
    temperature: float

class LoadCurveResponse(BaseModel):
    curve: List[HourlyLoadPoint]
    peakHour: Optional[str] = None
    peakKw: Optional[float] = None

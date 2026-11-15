"""
AI Forecast & Simulation Schemas
"""
from typing import List, Optional
from pydantic import BaseModel

class ForecastPoint(BaseModel):
    timestamp: str
    hour: int
    predictedKwh: float
    confidenceIntervalLow: float
    confidenceIntervalHigh: float

class ForecastResponse(BaseModel):
    model: str = "LSTM-SpatialTemporal"
    horizonHours: int = 24
    forecast: List[ForecastPoint]
    expectedPeakKwh: float
    expectedTotalKwh: float

class WhatIfSimulationRequest(BaseModel):
    solarCapacityMultiplier: float = 1.0
    thermostatOffsetF: float = 0.0
    evChargingHour: int = 23
    batteryStorageKwh: float = 0.0

class WhatIfSimulationResponse(BaseModel):
    simulatedDailyCost: float
    baselineDailyCost: float
    projectedMonthlySavings: float
    carbonReductionKg: float
    hourlySimulatedProfile: List[float]

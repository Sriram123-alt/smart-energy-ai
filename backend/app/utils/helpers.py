"""
Smart Energy AI - Enterprise Utility & Conversion Helper Functions
"""
import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Union
from app.utils.constants import (
    GRID_CO2_EMISSION_FACTOR_KG_PER_KWH,
    SOLAR_CO2_AVOIDANCE_FACTOR_KG_PER_KWH,
    TREE_CARBON_ABSORPTION_KG_PER_DAY,
    CAR_MILES_PER_KG_CO2
)

def watts_to_kw(watts: Union[int, float]) -> float:
    """Converts instantaneous power in Watts to Kilowatts (kW)."""
    return round(float(watts) / 1000.0, 3)

def kw_to_kwh(kw: Union[int, float], hours: Union[int, float] = 1.0) -> float:
    """Calculates energy consumption in kWh given average kW power and run hours."""
    return round(float(kw) * float(hours), 3)

def compute_carbon_footprint(grid_draw_kwh: float, solar_generation_kwh: float = 0.0) -> Dict[str, Any]:
    """
    Computes greenhouse gas emissions and offsets based on standard grid intensity metrics.
    """
    gross_emissions = grid_draw_kwh * GRID_CO2_EMISSION_FACTOR_KG_PER_KWH
    offset_emissions = solar_generation_kwh * SOLAR_CO2_AVOIDANCE_FACTOR_KG_PER_KWH
    net_emissions = max(0.0, gross_emissions - offset_emissions)

    trees_saved = offset_emissions / TREE_CARBON_ABSORPTION_KG_PER_DAY if TREE_CARBON_ABSORPTION_KG_PER_DAY > 0 else 0
    miles_saved = offset_emissions * CAR_MILES_PER_KG_CO2

    return {
        "grossEmissionsKg": round(gross_emissions, 2),
        "offsetEmissionsKg": round(offset_emissions, 2),
        "netEmissionsKg": round(net_emissions, 2),
        "treesEquivalent": int(trees_saved),
        "carMilesAvoided": round(miles_saved, 1)
    }

def calculate_time_of_use_cost(
    hourly_draw_kwh: List[float],
    peak_rate: float,
    off_peak_rate: float,
    peak_start_hour: int = 16,
    peak_end_hour: int = 21
) -> Dict[str, float]:
    """
    Calculates dynamic Time-of-Use (TOU) energy costs over a 24-hour cycle.
    """
    peak_kwh = 0.0
    off_peak_kwh = 0.0

    for hour_idx, kwh in enumerate(hourly_draw_kwh):
        hour = hour_idx % 24
        if peak_start_hour <= hour < peak_end_hour:
            peak_kwh += kwh
        else:
            off_peak_kwh += kwh

    peak_cost = peak_kwh * peak_rate
    off_peak_cost = off_peak_kwh * off_peak_rate
    total_cost = peak_cost + off_peak_cost

    return {
        "peakKwh": round(peak_kwh, 2),
        "offPeakKwh": round(off_peak_kwh, 2),
        "peakCost": round(peak_cost, 2),
        "offPeakCost": round(off_peak_cost, 2),
        "totalCost": round(total_cost, 2)
    }

def format_iso_timestamp(dt: Union[datetime, None] = None) -> str:
    """Returns standardized ISO 8601 timestamp string."""
    if dt is None:
        dt = datetime.now(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def sanitize_numerical(val: Any, default: float = 0.0) -> float:
    """Safely converts unknown types to float, falling back to default on error."""
    try:
        val_f = float(val)
        return 0.0 if math.isnan(val_f) or math.isinf(val_f) else val_f
    except (ValueError, TypeError):
        return default

"""
Unit tests for Smart Energy AI helper and conversion functions.
"""
import pytest
from app.utils.helpers import (
    watts_to_kw,
    kw_to_kwh,
    compute_carbon_footprint,
    calculate_time_of_use_cost,
    sanitize_numerical
)
from app.utils.constants import (
    GRID_CO2_EMISSION_FACTOR_KG_PER_KWH,
    SOLAR_CO2_AVOIDANCE_FACTOR_KG_PER_KWH
)

def test_watts_to_kw():
    assert watts_to_kw(1000) == 1.0
    assert watts_to_kw(3500) == 3.5
    assert watts_to_kw(0) == 0.0

def test_kw_to_kwh():
    assert kw_to_kwh(2.0, 3.0) == 6.0
    assert kw_to_kwh(1.5, 0.5) == 0.75

def test_compute_carbon_footprint():
    result = compute_carbon_footprint(grid_draw_kwh=10.0, solar_generation_kwh=5.0)
    expected_gross = round(10.0 * GRID_CO2_EMISSION_FACTOR_KG_PER_KWH, 2)
    expected_offset = round(5.0 * SOLAR_CO2_AVOIDANCE_FACTOR_KG_PER_KWH, 2)
    assert result["grossEmissionsKg"] == expected_gross
    assert result["offsetEmissionsKg"] == expected_offset
    assert result["netEmissionsKg"] == max(0.0, round(expected_gross - expected_offset, 2))
    assert result["treesEquivalent"] >= 0
    assert result["carMilesAvoided"] >= 0

def test_calculate_time_of_use_cost():
    # 24 hours of 1.0 kWh draw
    hourly = [1.0] * 24
    peak_rate = 0.30
    off_peak_rate = 0.10
    # Peak is 16 to 21 (5 hours)
    result = calculate_time_of_use_cost(hourly, peak_rate=peak_rate, off_peak_rate=off_peak_rate, peak_start_hour=16, peak_end_hour=21)
    assert result["peakKwh"] == 5.0
    assert result["offPeakKwh"] == 19.0
    assert result["peakCost"] == 1.50
    assert result["offPeakCost"] == 1.90
    assert result["totalCost"] == 3.40

def test_sanitize_numerical():
    assert sanitize_numerical("42.5") == 42.5
    assert sanitize_numerical(None, default=1.0) == 1.0
    assert sanitize_numerical("invalid", default=0.0) == 0.0

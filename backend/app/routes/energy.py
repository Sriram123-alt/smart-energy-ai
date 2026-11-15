from fastapi import APIRouter
from app.services.energy_service import EnergyService

router = APIRouter(prefix="/energy", tags=["energy"])

@router.get("/realtime")
def get_realtime():
    return EnergyService.get_realtime_metrics()

@router.get("/summary")
def get_summary():
    return EnergyService.get_today_summary()

@router.get("/curve")
def get_curve():
    return EnergyService.get_hourly_load_curve()

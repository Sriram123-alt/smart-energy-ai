from fastapi import APIRouter
from app.services.energy_service import EnergyService

router = APIRouter(prefix="/forecasting", tags=["forecasting"])

@router.get("")
def get_forecast(temp_offset: float = 0.0):
    return EnergyService.get_24h_forecast(temp_offset)

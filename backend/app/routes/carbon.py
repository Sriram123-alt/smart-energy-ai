from fastapi import APIRouter
from app.services.carbon_service import CarbonService

router = APIRouter(prefix="/carbon", tags=["carbon"])

@router.get("/details")
def get_carbon_details(grid_kwh: float, solar_kwh: float):
    return CarbonService.get_carbon_footprint_details(grid_kwh, solar_kwh)

@router.get("/historical")
def get_historical_carbon():
    return CarbonService.get_historical_carbon_data()


from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.appliance_schema import ApplianceOut, ApplianceUpdate, ApplianceCreate
from app.services.appliance_service import ApplianceService

router = APIRouter(prefix="/appliances", tags=["appliances"])

@router.get("", response_model=List[ApplianceOut])
def get_appliances():
    return ApplianceService.get_all_appliances()

@router.post("/{appliance_id}/toggle")
def toggle_appliance(appliance_id: str):
    res = ApplianceService.toggle_appliance(appliance_id)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.put("/{appliance_id}")
def update_appliance(appliance_id: str, data: ApplianceUpdate):
    res = ApplianceService.update_appliance(appliance_id, data.wattage, data.quantity, data.hours)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.post("")
def add_appliance(data: ApplianceCreate):
    res = ApplianceService.add_custom_appliance(data.name, data.wattage, data.quantity, data.hours)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.delete("/{appliance_id}")
def delete_appliance(appliance_id: str):
    res = ApplianceService.delete_appliance(appliance_id)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

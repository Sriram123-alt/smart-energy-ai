from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.bill_schema import BillHistoryOut, BillCalculateRequest, BillCalculateResponse
from app.services.billing_service import BillingService

router = APIRouter(prefix="/billing", tags=["billing"])

@router.get("/history", response_model=List[BillHistoryOut])
def get_bill_history():
    return BillingService.get_monthly_bill_history()

@router.post("/calculate", response_model=BillCalculateResponse)
def calculate_projection(req: BillCalculateRequest):
    return BillingService.calculate_bill_projection(
        req.tariffMode, req.ratePerKwh, req.serviceFee, req.appliancesKwh
    )

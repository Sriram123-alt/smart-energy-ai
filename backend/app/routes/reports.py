from fastapi import APIRouter, Query
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/preview")
def get_report_preview(startDate: str = Query(...), endDate: str = Query(...)):
    return ReportService.generate_report_preview(startDate, endDate)

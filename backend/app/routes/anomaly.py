from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import List
from app.schemas.anomaly_schema import AnomalyOut
from app.config.database import get_db_connection
from app.services.email_service import EmailService

from app.services.anomaly_service import AnomalyService

router = APIRouter(prefix="/anomalies", tags=["anomalies"])

class TestEmailRequest(BaseModel):
    email: EmailStr

class TriggerIncidentRequest(BaseModel):
    appliance: str = "Central Air Conditioner"
    severity: str = "critical"
    title: str = "Continuous Compressor Duty Cycle"
    description: str = "HVAC compressor drawing sustained 3.8 kW during mild ambient temperatures."
    impact_cost: float = 4.60
    impact_carbon: float = 1.95

@router.get("", response_model=List[AnomalyOut])
def get_anomalies():
    return AnomalyService.get_all_anomalies()

@router.post("/{anomaly_id}/resolve")
def resolve_anomaly(anomaly_id: str):
    success = AnomalyService.resolve_anomaly(anomaly_id)
    if not success:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    return {"success": True, "anomaly_id": anomaly_id}

@router.post("/trigger", response_model=AnomalyOut)
def trigger_new_incident(payload: TriggerIncidentRequest = None):
    """
    Manually triggers and inserts a brand new active incident (resolved = 0).
    """
    if payload:
        return AnomalyService.add_active_incident(
            appliance=payload.appliance,
            severity=payload.severity,
            title=payload.title,
            description=payload.description,
            impact_cost=payload.impact_cost,
            impact_carbon=payload.impact_carbon
        )
    # Default randomized active incident
    new_incidents = AnomalyService.generate_login_active_incidents(count=1)
    return new_incidents[0]

@router.post("/test-email")
def test_email(req: TestEmailRequest):
    subject = "⚠️ Smart Energy AI - System Alert Test"
    body = (
        "Hello,\n\nThis is a verified test alert from your Smart Energy AI Grid Controller.\n"
        "Your automated notifications are correctly configured to receive real-time anomaly alerts.\n\n"
        "Regards,\nSmart Energy AI Team"
    )
    res = EmailService.send_alert_email(req.email, subject, body)
    return res

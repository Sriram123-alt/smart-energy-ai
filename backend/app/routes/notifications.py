"""
Notifications and Alerts Routing Module
Handles grid alert notifications, threshold alerts, email dispatches, and user notification preferences.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.config.database import get_db_connection
from app.services.email_service import EmailService

router = APIRouter(prefix="/notifications", tags=["notifications"])

# In-memory notifications store for live alerts stream
_IN_MEMORY_NOTIFICATIONS = [
    {
        "id": "notif_1",
        "title": "Grid Peak Demand Approaching",
        "message": "Regional transformer load approaching 85% capacity. Shift heavy loads after 9:00 PM.",
        "type": "warning",
        "timestamp": "10 minutes ago",
        "read": False
    },
    {
        "id": "notif_2",
        "title": "Solar Generation Surplus",
        "message": "Rooftop solar production exceeded home consumption by 1.8 kW. Ideal time for EV charging.",
        "type": "success",
        "timestamp": "2 hours ago",
        "read": True
    },
    {
        "id": "notif_3",
        "title": "Standby Leakage Detected",
        "message": "Persistent 250W standby draw detected during inactive night hours on HVAC auxiliary circuit.",
        "type": "critical",
        "timestamp": "5 hours ago",
        "read": False
    }
]

class TestNotificationRequest(BaseModel):
    recipientEmail: str
    alertType: str
    customMessage: Optional[str] = None

class NotificationPreferences(BaseModel):
    emailAlerts: bool = True
    smsAlerts: bool = False
    peakTariffWarnings: bool = True
    solarSurplusAlerts: bool = True
    anomalyThreshold: str = "medium"  # "low", "medium", "high"


@router.get("")
def get_notifications():
    """Returns the stream of real-time grid alerts and notifications."""
    unread_count = sum(1 for n in _IN_MEMORY_NOTIFICATIONS if not n["read"])
    return {
        "notifications": _IN_MEMORY_NOTIFICATIONS,
        "totalCount": len(_IN_MEMORY_NOTIFICATIONS),
        "unreadCount": unread_count
    }


@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str):
    """Marks a notification as read."""
    for n in _IN_MEMORY_NOTIFICATIONS:
        if n["id"] == notification_id:
            n["read"] = True
            return {"success": True, "notification_id": notification_id}
    raise HTTPException(status_code=404, detail="Notification not found")


@router.post("/mark-all-read")
def mark_all_notifications_read():
    """Marks all notifications as read."""
    for n in _IN_MEMORY_NOTIFICATIONS:
        n["read"] = True
    return {"success": True, "message": "All notifications marked as read"}


@router.post("/dispatch-test")
def dispatch_test_alert(req: TestNotificationRequest):
    """Dispatches a real-time notification alert and simulates email transmission."""
    new_id = f"notif_{uuid.uuid4().hex[:6]}"
    title = f"Alert: {req.alertType.capitalize()} Condition"
    body = req.customMessage or f"System triggered a {req.alertType} energy event alert."
    
    # Send simulated email
    email_result = EmailService.send_alert_email(
        email=req.recipientEmail,
        subject=f"[Smart Energy AI] {title}",
        body=body
    )
    
    # Record notification
    new_notif = {
        "id": new_id,
        "title": title,
        "message": body,
        "type": req.alertType,
        "timestamp": "Just now",
        "read": False
    }
    _IN_MEMORY_NOTIFICATIONS.insert(0, new_notif)
    
    return {
        "success": True,
        "notification": new_notif,
        "emailResult": email_result
    }

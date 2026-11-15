"""
Integration & End-to-End API Tests for Smart Energy AI Backend.
Tests health checks, authentication, appliance controls, carbon analytics,
anomalies, AI recommendations, and notification routing.
"""
import pytest
from fastapi.testclient import TestClient
import uuid

# Set test environment if needed
import os
os.environ["SECRET_KEY"] = "test-secret-key-12345678"

from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify backend health check returns status 200 and healthy status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_notifications_stream():
    """Verify notifications alert stream endpoint."""
    response = client.get("/api/notifications")
    assert response.status_code == 200
    data = response.json()
    assert "notifications" in data
    assert "unreadCount" in data
    assert isinstance(data["notifications"], list)

def test_dispatch_test_notification():
    """Verify dispatching test alert."""
    payload = {
        "recipientEmail": "test_operator@gridenergy.io",
        "alertType": "warning",
        "customMessage": "Transformer branch T-42 peak capacity reached."
    }
    response = client.post("/api/notifications/dispatch-test", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["notification"]["type"] == "warning"

def test_carbon_details():
    """Verify carbon footprint calculation."""
    response = client.get("/api/carbon/details?grid_kwh=15.0&solar_kwh=8.0")
    assert response.status_code == 200
    data = response.json()
    assert "emittedKg" in data
    assert "offsetKg" in data
    assert "netCarbonKg" in data
    assert "equivalentTrees" in data
    assert "carMilesSaved" in data
    assert data["netCarbonKg"] >= 0

def test_get_appliances():
    """Verify appliance listing endpoint returns default seed appliances."""
    response = client.get("/api/appliances")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "name" in data[0]
    assert "wattage" in data[0]

def test_get_anomalies():
    """Verify anomalies listing endpoint."""
    response = client.get("/api/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_recommendations():
    """Verify recommendations endpoint."""
    response = client.get("/api/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_auth_workflow():
    """Verify user registration and subsequent login."""
    unique_email = f"startup_{uuid.uuid4().hex[:6]}@smartenergy.ai"
    reg_payload = {
        "name": "Sarah Connor",
        "email": unique_email,
        "password": "SecurePassword123!"
    }
    
    # 1. Register
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert "token" in reg_data
    assert reg_data["email"] == unique_email
    
    # 2. Login
    login_resp = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "SecurePassword123!"
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "token" in login_data
    assert login_data["email"] == unique_email


def test_login_creates_active_incidents():
    """Verify that when a user registers or logs in, new active incidents (resolved=0) are added."""
    # Check baseline active anomalies count
    initial_anoms = client.get("/api/anomalies").json()
    initial_active_count = len([a for a in initial_anoms if a["resolved"] == 0])

    # Register and login a new user
    user_email = f"operator_{uuid.uuid4().hex[:6]}@smartenergy.ai"
    reg_resp = client.post("/api/auth/register", json={
        "name": "Alex Chen",
        "email": user_email,
        "password": "Password9988!"
    })
    assert reg_resp.status_code == 200

    # Anomalies should have increased with new active incidents
    after_reg_anoms = client.get("/api/anomalies").json()
    after_reg_active = len([a for a in after_reg_anoms if a["resolved"] == 0])
    assert after_reg_active > initial_active_count

    # Now login the user
    login_resp = client.post("/api/auth/login", json={
        "email": user_email,
        "password": "Password9988!"
    })
    assert login_resp.status_code == 200

    # Anomalies should have added even more active incidents
    after_login_anoms = client.get("/api/anomalies").json()
    after_login_active = len([a for a in after_login_anoms if a["resolved"] == 0])
    assert after_login_active >= after_reg_active


def test_trigger_new_incident():
    """Verify manual triggering of a new active incident."""
    payload = {
        "appliance": "Substation Heat Pump",
        "severity": "critical",
        "title": "Substation Inverter Surge",
        "description": "Transient high voltage surge recorded on primary branch circuit.",
        "impact_cost": 5.20,
        "impact_carbon": 2.10
    }
    resp = client.post("/api/anomalies/trigger", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["resolved"] == 0
    assert data["appliance"] == "Substation Heat Pump"
    assert data["severity"] == "critical"
    assert data["impact_cost"] == 5.20

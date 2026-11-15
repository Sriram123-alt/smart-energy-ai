import uuid
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.config.database import get_db_connection

# Comprehensive pool of realistic smart energy anomaly incidents
ACTIVE_INCIDENT_TEMPLATES = [
    {
        "appliance": "Central Air Conditioner",
        "severity": "critical",
        "title": "Continuous Compressor Duty Cycle",
        "description": "HVAC compressor drawing sustained 3.8 kW during mild ambient temperatures. Suspected refrigerant leak or stuck contactor.",
        "impact_cost": 4.60,
        "impact_carbon": 1.95
    },
    {
        "appliance": "Heat Pump & HVAC",
        "severity": "critical",
        "title": "Emergency Strip Heat Lockout Failure",
        "description": "Backup 5.0 kW resistive heating elements energized simultaneously with compressor cycle during peak grid hours.",
        "impact_cost": 5.85,
        "impact_carbon": 2.45
    },
    {
        "appliance": "Electric Vehicle Charger",
        "severity": "warning",
        "title": "Unscheduled Supercharge Draw",
        "description": "EV Level 2 Charger active at 7.4 kW during dynamic peak tariff window ($0.42/kWh) instead of scheduled midnight slot.",
        "impact_cost": 4.15,
        "impact_carbon": 1.70
    },
    {
        "appliance": "Smart Refrigerator",
        "severity": "warning",
        "title": "Defrost Heater Duty Loop Anomaly",
        "description": "Refrigerator defrost circuit running continuously for 55 minutes, indicating potential bimetal thermostat failure.",
        "impact_cost": 1.85,
        "impact_carbon": 0.80
    },
    {
        "appliance": "Solar Inverter",
        "severity": "warning",
        "title": "PV Micro-Inverter Phase Imbalance",
        "description": "Branch circuit #2 displaying 18% harmonic voltage distortion and shedding 1.2 kW solar harvest back to neutral.",
        "impact_cost": 2.40,
        "impact_carbon": 1.10
    },
    {
        "appliance": "Smart Water Heater",
        "severity": "critical",
        "title": "Thermostat Drift & Phantom Boiling Cycle",
        "description": "Water heater lower element engaging periodically without water draw, indicating scale accumulation on temperature probe.",
        "impact_cost": 3.90,
        "impact_carbon": 1.65
    },
    {
        "appliance": "Washing Machine & Dryer",
        "severity": "warning",
        "title": "High Motor Resistance Surge",
        "description": "Dryer drum motor pulling excessive starting current (2.4 kW surge), suggesting bearing wear or exhaust vent restriction.",
        "impact_cost": 2.10,
        "impact_carbon": 0.90
    },
    {
        "appliance": "Smart Subpanel & Breaker",
        "severity": "critical",
        "title": "Standby Phantom Power Spike",
        "description": "Basement subpanel detecting unexpected 850W phantom draw during unoccupied night hours on auxiliary lighting circuits.",
        "impact_cost": 3.20,
        "impact_carbon": 1.35
    }
]


class AnomalyService:
    @staticmethod
    def get_all_anomalies() -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT * FROM anomalies ORDER BY rowid DESC")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def resolve_anomaly(anomaly_id: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id FROM anomalies WHERE id = ?", (anomaly_id,))
            row = cursor.fetchone()
            if not row:
                return False
            cursor.execute("UPDATE anomalies SET resolved = 1 WHERE id = ?", (anomaly_id,))
            conn.commit()
            return True
        finally:
            conn.close()

    @staticmethod
    def add_active_incident(
        appliance: str,
        severity: str,
        title: str,
        description: str,
        impact_cost: float,
        impact_carbon: float,
        timestamp: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates and stores a new active incident (resolved = 0) in the anomalies table.
        """
        if not timestamp:
            timestamp = datetime.now().strftime("Today, %I:%M %p")

        incident_id = f"anom_{uuid.uuid4().hex[:8]}"

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO anomalies (id, appliance, severity, timestamp, title, description, impact_cost, impact_carbon, resolved)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
                """,
                (incident_id, appliance, severity, timestamp, title, description, impact_cost, impact_carbon)
            )
            conn.commit()
        finally:
            conn.close()

        # Also push to real-time notifications stream
        try:
            from app.routes.notifications import _IN_MEMORY_NOTIFICATIONS
            _IN_MEMORY_NOTIFICATIONS.insert(0, {
                "id": f"notif_{uuid.uuid4().hex[:6]}",
                "title": f"Active Incident: {title}",
                "message": f"[{severity.upper()}] {appliance}: {description}",
                "type": severity if severity in ["critical", "warning"] else "warning",
                "timestamp": "Just now",
                "read": False
            })
        except Exception:
            pass

        return {
            "id": incident_id,
            "appliance": appliance,
            "severity": severity,
            "timestamp": timestamp,
            "title": title,
            "description": description,
            "impact_cost": impact_cost,
            "impact_carbon": impact_carbon,
            "resolved": 0
        }

    @staticmethod
    def generate_login_active_incidents(user_name: Optional[str] = None, count: int = 2) -> List[Dict[str, Any]]:
        """
        Generates new ACTIVE INCIDENTS whenever a user registers or logs into the platform.
        """
        created = []
        selected_templates = random.sample(ACTIVE_INCIDENT_TEMPLATES, min(count, len(ACTIVE_INCIDENT_TEMPLATES)))

        for tmpl in selected_templates:
            # Add slight variation to impact numbers to reflect unique real-time sensor readings
            cost_var = round(tmpl["impact_cost"] * random.uniform(0.92, 1.15), 2)
            carbon_var = round(tmpl["impact_carbon"] * random.uniform(0.92, 1.15), 2)
            time_str = datetime.now().strftime("Today, %I:%M %p")

            incident = AnomalyService.add_active_incident(
                appliance=tmpl["appliance"],
                severity=tmpl["severity"],
                title=tmpl["title"],
                description=tmpl["description"],
                impact_cost=cost_var,
                impact_carbon=carbon_var,
                timestamp=time_str
            )
            created.append(incident)

        return created

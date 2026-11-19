import sqlite3
import os
from app.config.settings import settings

def get_db_connection():
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL
    );
    """)

    # Seed Default Demo User if not present
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = 'demo@energyai.com'")
    if cursor.fetchone()[0] == 0:
        from app.config.security import get_password_hash
        hashed_pwd = get_password_hash("password123")
        cursor.execute(
            "INSERT INTO users (id, name, email, hashed_password) VALUES (?, ?, ?, ?)",
            ("usr_demo", "Grid Demo Operator", "demo@energyai.com", hashed_pwd)
        )
    
    # 2. Appliances Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appliances (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        wattage INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        hours INTEGER NOT NULL,
        status INTEGER DEFAULT 0,
        location TEXT NOT NULL,
        consumption INTEGER DEFAULT 0
    );
    """)
    
    # 3. Anomalies Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS anomalies (
        id TEXT PRIMARY KEY,
        appliance TEXT NOT NULL,
        severity TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        impact_cost REAL DEFAULT 0.0,
        impact_carbon REAL DEFAULT 0.0,
        resolved INTEGER DEFAULT 0
    );
    """)
    
    # 4. Recommendations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        savings_monthly REAL NOT NULL,
        difficulty TEXT NOT NULL,
        applied INTEGER DEFAULT 0
    );
    """)

    # Seed Default Data if empty
    cursor.execute("SELECT COUNT(*) FROM appliances")
    if cursor.fetchone()[0] == 0:
        default_appliances = [
            ("app_1", "Central Air Conditioner", "Cooling/Heating", 3500, 1, 6, 1, "Living Room", 3500),
            ("app_2", "Smart Refrigerator", "Kitchen", 150, 1, 24, 1, "Kitchen", 150),
            ("app_3", "Electric Vehicle Charger", "EV", 7200, 1, 2, 0, "Garage", 0),
            ("app_4", "Lighting (LEDs & Plugs)", "Lighting", 150, 1, 5, 1, "Multiple Areas", 150),
            ("app_5", "Smart Inverter (Solar Panel)", "Solar", -1200, 1, 8, 1, "Rooftop", -1200),
            ("app_6", "Washing Machine & Dryer", "Laundry", 1500, 1, 1, 0, "Utility Room", 0)
        ]
        cursor.executemany(
            "INSERT INTO appliances VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            default_appliances
        )

    cursor.execute("SELECT COUNT(*) FROM anomalies")
    if cursor.fetchone()[0] == 0:
        default_anomalies = [
            ("anom_1", "Air Conditioner", "warning", "Today, 02:15 AM", "Standby Leakage", 
             "Central cooling system drawing 250W during inactive standby hours.", 1.25, 0.4, 0),
            ("anom_2", "Water Heater", "critical", "Yesterday, 04:30 PM", "Thermal Overload Spill", 
             "Unusual persistent heating element draw exceeding 4.5 kW indicating thermostat fault.", 4.50, 1.8, 0),
            ("anom_3", "EV Charger", "warning", "2 days ago, 01:00 AM", "Off-Schedule Load", 
             "EV Charging activated during peak tariff window instead of scheduled overnight slot.", 2.10, 0.8, 1)
        ]
        cursor.executemany(
            "INSERT INTO anomalies VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            default_anomalies
        )

    cursor.execute("SELECT COUNT(*) FROM recommendations")
    if cursor.fetchone()[0] == 0:
        default_recs = [
            ("rec_1", "Cooling Setpoint Adjustment", "Increase thermostat cooling setpoint by 2°F to reduce HVAC cycles.", "Easy", 18.50, "Easy", 0),
            ("rec_2", "EV Scheduled Overnight Charging", "Reschedule EV charging to off-peak tariff periods between 11 PM and 6 AM.", "Medium", 25.00, "Medium", 0),
            ("rec_3", "Standby Load Isolation", "Use smart power strip controls to isolate phantom draws on console media systems.", "Easy", 8.20, "Easy", 0),
            ("rec_4", "Solar Generation Match", "Optimize laundry schedules to overlap with peak daytime solar generation.", "Hard", 12.40, "Hard", 0)
        ]
        cursor.executemany(
            "INSERT INTO recommendations VALUES (?, ?, ?, ?, ?, ?, ?)",
            default_recs
        )
        
    conn.commit()
    conn.close()

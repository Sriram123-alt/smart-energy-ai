import os
import csv
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.config.settings import settings

def generate_synthetic_datasets():
    # Make sure datasets directory exists
    os.makedirs(settings.DATASETS_DIR, exist_ok=True)
    
    # 1. Generate household energy data
    energy_csv_path = os.path.join(settings.DATASETS_DIR, "synthetic_energy_data.csv")
    if not os.path.exists(energy_csv_path) or os.path.getsize(energy_csv_path) == 0:
        start_date = datetime.now() - timedelta(days=30)
        data = []
        
        for hour_idx in range(30 * 24):
            current_time = start_date + timedelta(hours=hour_idx)
            hour = current_time.hour
            
            # Base grid consumption profile (peaking at morning 7-9 and evening 17-22)
            if 7 <= hour <= 9:
                base_draw = np.random.normal(1.8, 0.3)
            elif 17 <= hour <= 22:
                base_draw = np.random.normal(2.5, 0.4)
            else:
                base_draw = np.random.normal(0.6, 0.15)
                
            # Solar generation (bell curve peaking at 12 PM)
            if 6 <= hour <= 18:
                # Math: sine wave centered at 12 PM
                x = (hour - 6) / 12 * np.pi
                solar_gen = np.random.normal(1.8, 0.2) * np.sin(x)
                solar_gen = max(0.0, solar_gen)
            else:
                solar_gen = 0.0
                
            # Temperature profile (peaking around 3 PM)
            temp = 68 + 12 * np.sin((hour - 9) / 24 * 2 * np.pi) + np.random.normal(0, 1.5)
            
            # Occupancy rate
            if 8 <= hour <= 16:
                occupancy = np.random.choice([0.2, 0.5, 1.0], p=[0.6, 0.3, 0.1])
            else:
                occupancy = np.random.choice([0.8, 1.0], p=[0.2, 0.8])
                
            # Grid Net Draw (draw minus solar, capped at 0)
            grid_draw = max(0.0, base_draw - solar_gen * 0.7)
            
            # Inject anomalous spikes (about 1% probability)
            is_anomaly = np.random.choice([0, 1], p=[0.99, 0.01])
            if is_anomaly:
                grid_draw += np.random.uniform(3.5, 6.0)
                
            data.append({
                "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                "grid_draw_kwh": round(grid_draw, 3),
                "solar_generation_kwh": round(solar_gen, 3),
                "temperature": round(temp, 1),
                "occupancy_rate": round(occupancy, 2),
                "is_anomaly": is_anomaly
            })
            
        df = pd.DataFrame(data)
        df.to_csv(energy_csv_path, index=False)
        print(f"Generated synthetic energy data at {energy_csv_path} ({len(df)} records)")

    # Copy files also to default paths if needed
    for filename, headers, rows in [
        ("appliance_usage.csv", 
         ["appliance_id", "name", "category", "avg_wattage", "daily_hours"],
         [
             ["app_1", "Central Air Conditioner", "Cooling/Heating", "3500", "6"],
             ["app_2", "Smart Refrigerator", "Kitchen", "150", "24"],
             ["app_3", "Electric Vehicle Charger", "EV", "7200", "2"],
             ["app_4", "Lighting (LEDs & Plugs)", "Lighting", "150", "5"],
             ["app_5", "Smart Inverter", "Solar", "-1200", "8"],
             ["app_6", "Washing Machine & Dryer", "Laundry", "1500", "1"]
         ]),
        ("hourly_carbon_grid.csv",
         ["hour", "co2_intensity_g_kwh"],
         [[str(h), str(400 - 150 * np.sin((h - 6)/12 * np.pi) if 6 <= h <= 18 else 430)] for h in range(24)])
    ]:
        path = os.path.join(settings.DATASETS_DIR, filename)
        if not os.path.exists(path) or os.path.getsize(path) == 0:
            with open(path, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(headers)
                writer.writerows(rows)
            print(f"Generated synthetic {filename} dataset.")


def load_energy_data(filename: str = None):
    generate_synthetic_datasets()
    
    if filename:
        csv_path = os.path.join(settings.DATASETS_DIR, filename)
    else:
        # Prefer synthetic_energy_data.csv for single-home hourly telemetry
        synthetic_path = os.path.join(settings.DATASETS_DIR, "synthetic_energy_data.csv")
        custom_path = os.path.join(settings.DATASETS_DIR, "household_energy.csv")
        if os.path.exists(synthetic_path) and os.path.getsize(synthetic_path) > 100:
            csv_path = synthetic_path
        elif os.path.exists(custom_path) and os.path.getsize(custom_path) > 100:
            csv_path = custom_path
        else:
            csv_path = synthetic_path
        
    df = pd.read_csv(csv_path)

    # Standardize columns so models and services never fail with KeyError
    if "grid_draw_kwh" not in df.columns:
        if "energy_kwh" in df.columns:
            df["grid_draw_kwh"] = pd.to_numeric(df["energy_kwh"], errors="coerce").fillna(0.8)
        else:
            df["grid_draw_kwh"] = 0.8

    if "solar_generation_kwh" not in df.columns:
        if "peak_draw_kw" in df.columns:
            df["solar_generation_kwh"] = (pd.to_numeric(df["peak_draw_kw"], errors="coerce").fillna(0.0) * 0.3)
        else:
            df["solar_generation_kwh"] = 0.0

    if "temperature" not in df.columns:
        df["temperature"] = 68.0
    else:
        df["temperature"] = pd.to_numeric(df["temperature"], errors="coerce").fillna(68.0)

    if "occupancy_rate" not in df.columns:
        if "occupants" in df.columns:
            df["occupancy_rate"] = (pd.to_numeric(df["occupants"], errors="coerce").fillna(2) / 4.0).clip(0.1, 1.0)
        else:
            df["occupancy_rate"] = 1.0

    if "timestamp" not in df.columns:
        if "date" in df.columns:
            try:
                df["timestamp"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                base = datetime.now() - timedelta(hours=len(df))
                df["timestamp"] = [(base + timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S") for i in range(len(df))]
        else:
            base = datetime.now() - timedelta(hours=len(df))
            df["timestamp"] = [(base + timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S") for i in range(len(df))]

    if "is_anomaly" not in df.columns:
        df["is_anomaly"] = 0

    return df



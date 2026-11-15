import datetime
import numpy as np
from app.config.database import get_db_connection
from app.dl.preprocessing.clean_data import load_energy_data
from app.dl.inference.forecast import predict_next_24h_draw
from app.dl.inference.anomaly_detection import detect_anomaly

def _normalize_df(df):
    """
    Normalize any dataset to the standard columns expected by energy service.
    Handles both synthetic (grid_draw_kwh, solar_generation_kwh, timestamp)
    and user-uploaded (household_energy.csv: energy_kwh, peak_draw_kw, date) formats.
    """
    # If already has standard columns, return as-is
    if "grid_draw_kwh" in df.columns and "timestamp" in df.columns:
        return df

    import pandas as pd

    # Map user dataset columns to standard names
    col_map = {}
    if "energy_kwh" in df.columns:
        col_map["energy_kwh"] = "grid_draw_kwh"
    if "peak_draw_kw" in df.columns:
        col_map["peak_draw_kw"] = "solar_generation_kwh"  # Use peak as proxy
    
    df = df.rename(columns=col_map).copy()
    
    # Synthesize solar_generation_kwh if still missing (assume 30% of grid draw)
    if "solar_generation_kwh" not in df.columns:
        df["solar_generation_kwh"] = df.get("grid_draw_kwh", pd.Series([0.5] * len(df))) * 0.3

    # Synthesize timestamp column from date column or index
    if "timestamp" not in df.columns:
        if "date" in df.columns:
            try:
                df["timestamp"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                base = datetime.datetime.now() - datetime.timedelta(hours=len(df))
                df["timestamp"] = [(base + datetime.timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
                                   for i in range(len(df))]
        else:
            base = datetime.datetime.now() - datetime.timedelta(hours=len(df))
            df["timestamp"] = [(base + datetime.timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
                               for i in range(len(df))]

    # Ensure temperature column
    if "temperature" not in df.columns:
        df["temperature"] = 68.0

    return df


class EnergyService:
    @staticmethod
    def get_realtime_metrics() -> dict:
        # 1. Fetch sum of active appliance consumptions
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT SUM(consumption) FROM appliances")
        row = cursor.fetchone()
        active_draw_watts = row[0] if row[0] is not None else 0
        conn.close()
        
        # Convert to kW
        active_draw_kw = active_draw_watts / 1000.0
        
        # 2. Dynamic solar generation depending on current time of day (centered at 12 PM)
        now = datetime.datetime.now()
        hour = now.hour + now.minute / 60.0
        
        # Solar inverter is checked if active in DB
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT status FROM appliances WHERE category = 'Solar'")
        row = cursor.fetchone()
        solar_active = row[0] == 1 if row else False
        conn.close()
        
        solar_gen = 0.0
        if solar_active and 6.0 <= hour <= 18.0:
            # Sinusoidal generator peaking at 3.5 kW
            solar_gen = 3.5 * np.sin((hour - 6.0) / 12.0 * np.pi)
            solar_gen = max(0.0, solar_gen + np.random.normal(0, 0.15))
            
        # Grid net draw (active load minus solar generation)
        grid_draw = max(0.08, active_draw_kw - solar_gen * 0.8)  # Min standby grid draw 80W
        
        return {
            "gridDrawKW": round(grid_draw, 3),
            "solarGenerationKW": round(solar_gen, 3),
            "appliancesDrawKW": round(active_draw_kw, 3),
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
        }

    @staticmethod
    def get_today_summary() -> dict:
        realtime = EnergyService.get_realtime_metrics()
        df = _normalize_df(load_energy_data())
        
        # Aggregate last 24 hours for daily usage metrics
        last_24h = df.tail(24)
        usage_today = float(last_24h["grid_draw_kwh"].sum())
        solar_today = float(last_24h["solar_generation_kwh"].sum())
        
        # Calculate grid independence percentage
        total_load = usage_today + solar_today
        grid_indep = (solar_today / total_load * 100.0) if total_load > 0 else 0.0
        
        # Daily carbon equivalent (0.42 kg CO2 per kWh grid draw)
        carbon_today = usage_today * 0.42
        
        # Estimated cost today (standard rate $0.15/kWh)
        cost_today = usage_today * 0.15
        
        return {
            "currentDraw": realtime["gridDrawKW"],
            "solarGeneration": realtime["solarGenerationKW"],
            "usageToday": round(usage_today, 2),
            "solarToday": round(solar_today, 2),
            "gridIndependence": min(100.0, round(grid_indep, 1)),
            "carbonToday": round(carbon_today, 2),
            "costToday": round(cost_today, 2)
        }

    @staticmethod
    def get_hourly_load_curve() -> list:
        # Returns past 24 hours load history from dataset
        df = _normalize_df(load_energy_data())
        last_24 = df.tail(24)
        
        curve = []
        for idx, row in last_24.iterrows():
            # Get hour from timestamp string
            try:
                dt = datetime.datetime.strptime(str(row["timestamp"]), "%Y-%m-%d %H:%M:%S")
                time_label = dt.strftime("%H:00")
            except Exception:
                time_label = f"{idx % 24:02d}:00"

            try:
                grid_draw = float(row["grid_draw_kwh"])
            except Exception:
                grid_draw = 0.5

            try:
                solar_gen = float(row["solar_generation_kwh"])
            except Exception:
                solar_gen = 0.0

            try:
                temp = float(row["temperature"])
            except Exception:
                temp = 68.0

            curve.append({
                "time": time_label,
                "consumption": round(grid_draw + solar_gen, 2),
                "solar": round(solar_gen, 2),
                "grid": round(grid_draw, 2),
                "temp": round(temp, 1)
            })
        return curve

    @staticmethod
    def get_24h_forecast(temp_offset: float = 0.0) -> list:
        # 1. Fetch recent history
        df = _normalize_df(load_energy_data())
        recent_history = df.tail(24).to_dict(orient="records")
        
        # 2. Call LSTM model predictions
        predicted_draws = predict_next_24h_draw(recent_history)
        
        # 3. Apply temperature sensitivity offset (AC increases 6% per degree F)
        temp_multiplier = 1.0 + (temp_offset * 0.06)
        
        forecast_curve = []
        now = datetime.datetime.now()
        for h in range(24):
            future_time = now + datetime.timedelta(hours=h+1)
            # Estimate solar (bell curve centered at 12 PM)
            hour_of_day = future_time.hour
            solar_est = 0.0
            if 6 <= hour_of_day <= 18:
                solar_est = 3.2 * np.sin((hour_of_day - 6) / 12 * np.pi)
                solar_est = max(0.0, solar_est)
                
            pred_draw = predicted_draws[h] * temp_multiplier
            net_grid = max(0.05, pred_draw - solar_est * 0.7)
            
            # Confidence interval shading (standard deviation bound)
            confidence_upper = net_grid + 0.35
            confidence_lower = max(0.0, net_grid - 0.35)
            
            forecast_curve.append({
                "day": future_time.strftime("%a %H:00"),
                "predictedUsage": round(net_grid, 2),
                "predictedSolar": round(solar_est, 2),
                "gridNet": round(net_grid, 2),
                "ciUpper": round(confidence_upper, 2),
                "ciLower": round(confidence_lower, 2)
            })
            
        return forecast_curve

    @staticmethod
    def run_anomaly_check() -> dict:
        # Extract last 24 hours of grid draw
        df = _normalize_df(load_energy_data())
        daily_draws = df.tail(24)["grid_draw_kwh"].tolist()
        
        # Run Autoencoder anomaly checker
        result = detect_anomaly(daily_grid_draw=daily_draws)
        return result

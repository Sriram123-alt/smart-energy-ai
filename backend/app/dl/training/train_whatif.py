import os
import numpy as np
import pandas as pd
from app.config.settings import settings
from app.dl.preprocessing.normalize import DataNormalizer
from app.dl.models.whatif_predictor import build_whatif_model

def train_whatif():
    # 1. Generate synthetic scenario matrix
    n_samples = 1000
    np.random.seed(42)
    
    thermostat = np.random.uniform(65, 82, n_samples)
    solar_cap = np.random.uniform(0, 15, n_samples)
    ev_hours = np.random.uniform(0, 8, n_samples)
    appliance_draw = np.random.uniform(1.0, 8.0, n_samples)
    
    X = np.column_stack([thermostat, solar_cap, ev_hours, appliance_draw])
    
    # 2. Map scenarios to realistic targets (Monthly Bill and Carbon Footprint)
    y = []
    for i in range(n_samples):
        temp = thermostat[i]
        solar = solar_cap[i]
        ev = ev_hours[i]
        appl = appliance_draw[i]
        
        # Calculate monthly kWh
        base_kwh = appl * 24 * 30.4
        
        # Thermostat impact (AC load decreases 6% per degree F increase in cooling)
        cooling_temp_diff = max(0, 78 - temp)
        ac_kwh = cooling_temp_diff * 4.5 * 30.4
        
        # EV load (7.2 kW draw * ev hours * 30.4 days)
        ev_kwh = ev * 7.2 * 30.4
        
        # Solar generation (solar cap * 4 hours peak sun * 30.4 days)
        solar_gen_kwh = solar * 4.2 * 30.4
        
        total_kwh = max(100.0, base_kwh + ac_kwh + ev_kwh - solar_gen_kwh)
        
        # Monthly Bill estimate ($0.16/kWh rate)
        monthly_bill = total_kwh * 0.16 + 15.00
        
        # Carbon footprint (0.42 kg CO2 per kWh grid draw, offsets for solar)
        carbon_footprint = max(15.0, (base_kwh + ac_kwh + ev_kwh) * 0.42 - solar_gen_kwh * 0.45)
        
        y.append([monthly_bill, carbon_footprint])
        
    y = np.array(y)
    
    # Normalize
    input_scaler = DataNormalizer()
    X_scaled = input_scaler.fit_transform(X)
    
    output_scaler = DataNormalizer()
    y_scaled = output_scaler.fit_transform(y)
    
    # Save scalers
    input_scaler.save(os.path.join(settings.SAVED_MODELS_DIR, "whatif_input_scaler.pkl"))
    output_scaler.save(os.path.join(settings.SAVED_MODELS_DIR, "whatif_output_scaler.pkl"))
    
    # Build and fit MLP
    model = build_whatif_model(input_dim=4, output_dim=2)
    model.fit(X_scaled, y_scaled, epochs=8, batch_size=32, verbose=0)
    
    # Save model
    model_path = os.path.join(settings.SAVED_MODELS_DIR, "whatif_model.keras")
    model.save(model_path)
    print(f"What-If simulator model trained and saved at {model_path}")

if __name__ == "__main__":
    train_whatif()

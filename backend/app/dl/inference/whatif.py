import os
import numpy as np
import keras
from app.config.settings import settings
from app.dl.preprocessing.normalize import DataNormalizer

_model = None
_in_scaler = None
_out_scaler = None

def load_resources():
    global _model, _in_scaler, _out_scaler
    model_path = os.path.join(settings.SAVED_MODELS_DIR, "whatif_model.keras")
    in_scaler_path = os.path.join(settings.SAVED_MODELS_DIR, "whatif_input_scaler.pkl")
    out_scaler_path = os.path.join(settings.SAVED_MODELS_DIR, "whatif_output_scaler.pkl")
    
    if _model is None and os.path.exists(model_path):
        _model = keras.models.load_model(model_path)
    if _in_scaler is None and os.path.exists(in_scaler_path):
        _in_scaler = DataNormalizer.load(in_scaler_path)
    if _out_scaler is None and os.path.exists(out_scaler_path):
        _out_scaler = DataNormalizer.load(out_scaler_path)
        
    return _model, _in_scaler, _out_scaler

def predict_whatif_outcomes(thermostat_f: float, solar_kw: float, ev_hours: float, appliance_draw_kw: float) -> dict:
    """
    Returns: dict {"monthly_bill": float, "carbon_footprint": float}
    """
    model, in_scaler, out_scaler = load_resources()
    
    if model is None or in_scaler is None or out_scaler is None:
        # Heuristic fallback calculations
        print("What-If model not trained. Using heuristic fallback outcomes.")
        base_kwh = appliance_draw_kw * 24 * 30.4
        ac_kwh = max(0, 78 - thermostat_f) * 4.5 * 30.4
        ev_kwh = ev_hours * 7.2 * 30.4
        solar_gen = solar_kw * 4.2 * 30.4
        
        total_kwh = max(100.0, base_kwh + ac_kwh + ev_kwh - solar_gen)
        bill = total_kwh * 0.16 + 15.00
        carbon = max(15.0, (base_kwh + ac_kwh + ev_kwh) * 0.42 - solar_gen * 0.45)
        
        return {
            "monthly_bill": round(bill, 2),
            "carbon_footprint": round(carbon, 1)
        }
        
    # Standardize input array
    raw_in = np.array([[thermostat_f, solar_kw, ev_hours, appliance_draw_kw]])
    scaled_in = in_scaler.transform(raw_in)
    
    # Predict
    scaled_out = model.predict(scaled_in, verbose=0)
    
    # Inverse transform outputs
    raw_out = out_scaler.inverse_transform(scaled_out)[0]
    
    return {
        "monthly_bill": round(max(10.0, float(raw_out[0])), 2),
        "carbon_footprint": round(max(5.0, float(raw_out[1])), 1)
    }

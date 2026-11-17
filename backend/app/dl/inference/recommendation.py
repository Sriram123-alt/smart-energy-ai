import os
import numpy as np
from app.config.settings import settings
from app.dl.preprocessing.normalize import DataNormalizer

_model = None
_scaler = None

def load_resources():
    global _model, _scaler
    try:
        import keras
        model_path = os.path.join(settings.SAVED_MODELS_DIR, "recommender_model.keras")
        scaler_path = os.path.join(settings.SAVED_MODELS_DIR, "recommender_scaler.pkl")
        
        if _model is None and os.path.exists(model_path):
            _model = keras.models.load_model(model_path)
        if _scaler is None and os.path.exists(scaler_path):
            _scaler = DataNormalizer.load(scaler_path)
    except Exception as e:
        _model = None
        _scaler = None
        
    return _model, _scaler

def get_recommendation_priorities(avg_temp: float, month: int, grid_load_kw: float, solar_gen_kw: float) -> list:
    """
    Returns: list of 4 float probabilities representing priority for:
      [Thermostat cooling, EV scheduling, Appliance solar shifting, Standby load isolation]
    """
    model, scaler = load_resources()
    
    if model is None or scaler is None:
        # Fallback probabilities
        print("Recommender model not trained. Using heuristic fallback priorities.")
        if avg_temp > 82:
            return [0.7, 0.1, 0.1, 0.1]
        elif grid_load_kw > 4.5 and solar_gen_kw < 0.5:
            return [0.1, 0.6, 0.2, 0.1]
        elif solar_gen_kw > 1.5:
            return [0.1, 0.1, 0.6, 0.2]
        else:
            return [0.2, 0.2, 0.2, 0.4]
            
    # Format & scale input
    raw_in = np.array([[avg_temp, month, grid_load_kw, solar_gen_kw]])
    scaled_in = scaler.transform(raw_in)
    
    # Predict probabilities
    probs = model.predict(scaled_in, verbose=0)[0]
    return [round(float(p), 3) for p in probs]

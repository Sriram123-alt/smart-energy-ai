import os
import numpy as np
from app.config.settings import settings
from app.dl.preprocessing.normalize import DataNormalizer

# Global model cache
_model = None
_scaler = None

def load_resources():
    global _model, _scaler
    try:
        import keras
        model_path = os.path.join(settings.SAVED_MODELS_DIR, "lstm_forecast_model.keras")
        scaler_path = os.path.join(settings.SAVED_MODELS_DIR, "lstm_scaler.pkl")
        
        if _model is None and os.path.exists(model_path):
            _model = keras.models.load_model(model_path)
        if _scaler is None and os.path.exists(scaler_path):
            _scaler = DataNormalizer.load(scaler_path)
    except Exception as e:
        _model = None
        _scaler = None
        
    return _model, _scaler

def predict_next_24h_draw(recent_hourly_history: list) -> list:
    """
    recent_hourly_history: list of 24 dicts containing:
       [{"grid_draw_kwh": val, "solar_generation_kwh": val, "temperature": val, "occupancy_rate": val}]
    Returns: list of 24 float values (predicted hourly grid draw for the next day)
    """
    model, scaler = load_resources()
    
    if model is None or scaler is None:
        # Graceful fallback: return simple synthetic predictions based on daily shape
        print("LSTM model not trained. Returning fallback predictions.")
        fallback = [0.8 + 0.4 * np.sin((h - 6)/12 * np.pi) if 6 <= h <= 18 else 0.7 for h in range(24)]
        return [round(max(0.1, val), 2) for val in fallback]
        
    # Format inputs
    features = []
    for item in recent_hourly_history[-24:]:
        features.append([
            item.get("grid_draw_kwh", 0.8),
            item.get("solar_generation_kwh", 0.0),
            item.get("temperature", 70.0),
            item.get("occupancy_rate", 1.0)
        ])
        
    # Ensure shape is 24x4
    while len(features) < 24:
        features.insert(0, [0.8, 0.0, 70.0, 1.0])
        
    # Scale inputs
    scaled_in = scaler.transform(features) # (24, 4)
    scaled_in = np.expand_dims(scaled_in, axis=0) # (1, 24, 4)
    
    # Predict
    preds_scaled = model.predict(scaled_in, verbose=0)[0] # (24,)
    
    # Inverse scale (target is index 0: grid_draw_kwh)
    # Scaler expect (N, 4) shape to inverse scale. Create dummy column data.
    dummy_matrix = np.zeros((24, 4))
    dummy_matrix[:, 0] = preds_scaled
    
    preds_unscaled = scaler.inverse_transform(dummy_matrix)[:, 0]
    return [round(max(0.05, float(val)), 2) for val in preds_unscaled]

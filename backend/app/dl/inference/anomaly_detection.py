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
        model_path = os.path.join(settings.SAVED_MODELS_DIR, "autoencoder_model.keras")
        scaler_path = os.path.join(settings.SAVED_MODELS_DIR, "autoencoder_scaler.pkl")
        
        if _model is None and os.path.exists(model_path):
            _model = keras.models.load_model(model_path)
        if _scaler is None and os.path.exists(scaler_path):
            _scaler = DataNormalizer.load(scaler_path)
    except Exception as e:
        _model = None
        _scaler = None
        
    return _model, _scaler

def detect_anomaly(daily_grid_draw: list, threshold=0.12) -> dict:
    """
    daily_grid_draw: list of 24 float hourly load values.
    Returns: dict {"is_anomaly": bool, "reconstruction_loss": float}
    """
    if not daily_grid_draw:
        return {"is_anomaly": False, "reconstruction_loss": 0.0}

    # Sanitize and ensure exactly 24 valid floats
    clean_draws = []
    for val in daily_grid_draw:
        try:
            f = float(val)
            clean_draws.append(0.5 if np.isnan(f) or np.isinf(f) else f)
        except (ValueError, TypeError):
            clean_draws.append(0.5)

    while len(clean_draws) < 24:
        clean_draws.append(0.5)
    clean_draws = clean_draws[:24]

    model, scaler = load_resources()
    
    if model is None or scaler is None:
        # Fallback anomaly check based on threshold variance
        print("Autoencoder model not trained. Using heuristic anomaly check.")
        peak = max(clean_draws)
        avg = sum(clean_draws) / len(clean_draws)
        is_anom = peak > 5.5 or (peak > 4.0 and avg > 2.2)
        return {"is_anomaly": bool(is_anom), "reconstruction_loss": 0.05 if is_anom else 0.01}
        
    # Standardize inputs
    draws = np.array(clean_draws).reshape(-1, 1)
    scaled_draws = scaler.transform(draws).flatten() # Scale all elements
    scaled_in = np.expand_dims(scaled_draws, axis=0) # (1, 24)
    
    # Reconstruct
    reconstructed = model.predict(scaled_in, verbose=0)[0] # (24,)
    
    # Calculate Mean Squared Error (MSE)
    mse = float(np.mean(np.power(scaled_draws - reconstructed, 2)))
    
    return {
        "is_anomaly": mse > threshold,
        "reconstruction_loss": round(mse, 4)
    }

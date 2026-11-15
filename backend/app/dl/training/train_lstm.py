import os
import numpy as np
import pandas as pd
from app.config.settings import settings
from app.dl.preprocessing.clean_data import load_energy_data
from app.dl.preprocessing.normalize import DataNormalizer
from app.dl.models.lstm_forecasting import build_lstm_model

def train_lstm():
    df = load_energy_data()
    
    # Extract features
    features = ["grid_draw_kwh", "solar_generation_kwh", "temperature", "occupancy_rate"]
    data = df[features].values
    
    # Normalize features
    scaler = DataNormalizer()
    scaled_data = scaler.fit_transform(data)
    
    # Save the scaler
    scaler_path = os.path.join(settings.SAVED_MODELS_DIR, "lstm_scaler.pkl")
    scaler.save(scaler_path)
    
    # Create time-series windows (use 24 hours to predict next 24 hours)
    n_steps_in = 24
    n_steps_out = 24
    
    X, y = [], []
    for i in range(len(scaled_data) - n_steps_in - n_steps_out + 1):
        X.append(scaled_data[i : i + n_steps_in])
        # Target is grid_draw_kwh (index 0) for the next 24 steps
        y.append(scaled_data[i + n_steps_in : i + n_steps_in + n_steps_out, 0])
        
    X = np.array(X)
    y = np.array(y)
    
    # Build and fit model
    model = build_lstm_model(input_shape=(n_steps_in, len(features)), output_steps=n_steps_out)
    model.fit(X, y, epochs=3, batch_size=32, verbose=0)
    
    # Save model
    model_path = os.path.join(settings.SAVED_MODELS_DIR, "lstm_forecast_model.keras")
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    model.save(model_path)
    print(f"LSTM model training complete and saved at {model_path}")

if __name__ == "__main__":
    train_lstm()

import os
import numpy as np
import pandas as pd
from app.config.settings import settings
from app.dl.preprocessing.clean_data import load_energy_data
from app.dl.preprocessing.normalize import DataNormalizer
from app.dl.models.autoencoder_anomaly import build_autoencoder_model

def train_autoencoder():
    df = load_energy_data()
    
    # We train the autoencoder on grid_draw_kwh values only (daily patterns)
    grid_draw = df["grid_draw_kwh"].values.reshape(-1, 1)
    
    # Normalize
    scaler = DataNormalizer()
    scaled_grid = scaler.fit_transform(grid_draw)
    
    # Save the scaler
    scaler_path = os.path.join(settings.SAVED_MODELS_DIR, "autoencoder_scaler.pkl")
    scaler.save(scaler_path)
    
    # Reshape into daily sequences of 24 hours
    n_hours = 24
    X = []
    # Sliding window of 24 hours
    for i in range(len(scaled_grid) - n_hours + 1):
        X.append(scaled_grid[i : i + n_hours].flatten())
        
    X = np.array(X)
    
    # Build and fit model
    model = build_autoencoder_model(input_dim=n_hours)
    # Target is input itself for autoencoder reconstruction
    model.fit(X, X, epochs=5, batch_size=16, verbose=0)
    
    # Save model
    model_path = os.path.join(settings.SAVED_MODELS_DIR, "autoencoder_model.keras")
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    model.save(model_path)
    print(f"Autoencoder model training complete and saved at {model_path}")

if __name__ == "__main__":
    train_autoencoder()

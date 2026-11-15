import os
import numpy as np
import pandas as pd
import keras
from app.config.settings import settings
from app.dl.preprocessing.normalize import DataNormalizer
from app.dl.models.recommendation_nn import build_recommender_model

def train_recommender():
    n_samples = 1000
    np.random.seed(10)
    
    avg_temp = np.random.uniform(50, 95, n_samples)
    month = np.random.randint(1, 13, n_samples)
    grid_load = np.random.uniform(0.5, 8.0, n_samples)
    solar_gen = np.random.uniform(0.0, 5.0, n_samples)
    
    X = np.column_stack([avg_temp, month, grid_load, solar_gen])
    
    # Labeling logic: one-hot vector [thermostat, ev_schedule, appliance_shift, standby]
    y = []
    for i in range(n_samples):
        t = avg_temp[i]
        gl = grid_load[i]
        sg = solar_gen[i]
        
        # Determine priority category
        if t > 82:
            cat = 0 # Thermostat adjustment
        elif gl > 5.0 and sg < 1.0:
            cat = 1 # EV Schedule (move load)
        elif sg > 2.0 and gl > 3.0:
            cat = 2 # Appliance daytime shifts (match solar)
        else:
            cat = 3 # Standby loads isolation
            
        y.append(cat)
        
    y = keras.utils.to_categorical(np.array(y), num_classes=4)
    
    # Normalize inputs
    scaler = DataNormalizer()
    X_scaled = scaler.fit_transform(X)
    
    # Save input scaler
    scaler.save(os.path.join(settings.SAVED_MODELS_DIR, "recommender_scaler.pkl"))
    
    # Build and fit model
    model = build_recommender_model(input_dim=4, num_classes=4)
    model.fit(X_scaled, y, epochs=5, batch_size=32, verbose=0)
    
    # Save model
    model_path = os.path.join(settings.SAVED_MODELS_DIR, "recommender_model.keras")
    model.save(model_path)
    print(f"Recommender model training complete and saved at {model_path}")

if __name__ == "__main__":
    train_recommender()

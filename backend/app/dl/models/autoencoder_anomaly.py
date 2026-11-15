import keras
from keras import layers

def build_autoencoder_model(input_dim=24):
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        # Encoder
        layers.Dense(16, activation="relu"),
        layers.Dense(8, activation="relu"),
        layers.Dense(4, activation="relu"), # Latent dimension
        
        # Decoder
        layers.Dense(8, activation="relu"),
        layers.Dense(16, activation="relu"),
        layers.Dense(input_dim, activation="linear")
    ])
    
    model.compile(
        optimizer="adam",
        loss="mse",
        metrics=["mae"]
    )
    return model

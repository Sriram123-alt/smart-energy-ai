import keras
from keras import layers

def build_whatif_model(input_dim=4, output_dim=2):
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(32, activation="relu"),
        layers.Dense(16, activation="relu"),
        layers.Dense(8, activation="relu"),
        layers.Dense(output_dim, activation="linear")
    ])
    
    model.compile(
        optimizer="adam",
        loss="mse",
        metrics=["mae"]
    )
    return model

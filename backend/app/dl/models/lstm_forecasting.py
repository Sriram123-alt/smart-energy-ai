import keras
from keras import layers

def build_lstm_model(input_shape, output_steps=24):
    model = keras.Sequential([
        layers.Input(shape=input_shape),
        layers.LSTM(64, return_sequences=True),
        layers.Dropout(0.2),
        layers.LSTM(32),
        layers.Dropout(0.1),
        layers.Dense(output_steps)
    ])
    
    model.compile(
        optimizer="adam",
        loss="mse",
        metrics=["mae"]
    )
    return model

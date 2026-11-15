import keras
from keras import layers

def build_recommender_model(input_dim=4, num_classes=4):
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(24, activation="relu"),
        layers.Dense(12, activation="relu"),
        layers.Dense(num_classes, activation="softmax")
    ])
    
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model

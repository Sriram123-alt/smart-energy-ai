from sklearn.preprocessing import MinMaxScaler
import joblib
import os
from app.config.settings import settings

class DataNormalizer:
    def __init__(self, feature_range=(0, 1)):
        self.scaler = MinMaxScaler(feature_range=feature_range)

    def fit(self, data):
        self.scaler.fit(data)
        return self

    def transform(self, data):
        return self.scaler.transform(data)

    def fit_transform(self, data):
        return self.scaler.fit_transform(data)

    def inverse_transform(self, data):
        return self.scaler.inverse_transform(data)

    def save(self, filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self.scaler, filepath)

    @classmethod
    def load(cls, filepath):
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"No normalizer artifact found at {filepath}")
        normalizer = cls()
        normalizer.scaler = joblib.load(filepath)
        return normalizer

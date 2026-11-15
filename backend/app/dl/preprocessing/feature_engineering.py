"""
Smart Energy AI - Feature Engineering Pipeline
Provides transformations for time-series energy signals, cyclic time encoding,
rolling volatility, and heating/cooling degree days.
"""
import numpy as np
import pandas as pd
from typing import List, Tuple, Union

class EnergyFeatureEngineer:
    """
    Production feature engineering engine for smart grid & microgrid telemetry.
    """
    
    @staticmethod
    def add_cyclical_time_features(df: pd.DataFrame, timestamp_col: str = "timestamp") -> pd.DataFrame:
        """
        Encodes hour-of-day and day-of-week into continuous cyclical sine/cosine representations.
        """
        df = df.copy()
        if timestamp_col in df.columns:
            ts = pd.to_datetime(df[timestamp_col], errors="coerce")
            
            # Hour cycle (24h period)
            df["hour_sin"] = np.sin(2 * np.pi * ts.dt.hour / 24.0)
            df["hour_cos"] = np.cos(2 * np.pi * ts.dt.hour / 24.0)
            
            # Day of week cycle (7d period)
            df["dayofweek_sin"] = np.sin(2 * np.pi * ts.dt.dayofweek / 7.0)
            df["dayofweek_cos"] = np.cos(2 * np.pi * ts.dt.dayofweek / 7.0)
            
            # Weekend indicator
            df["is_weekend"] = ts.dt.dayofweek.isin([5, 6]).astype(int)
        return df

    @staticmethod
    def add_degree_days(df: pd.DataFrame, temp_col: str = "temperature", base_temp: float = 65.0) -> pd.DataFrame:
        """
        Calculates Cooling Degree Days (CDD) and Heating Degree Days (HDD).
        """
        df = df.copy()
        if temp_col in df.columns:
            temps = pd.to_numeric(df[temp_col], errors="coerce").fillna(base_temp)
            df["cooling_degree_factor"] = np.maximum(0.0, temps - base_temp)
            df["heating_degree_factor"] = np.maximum(0.0, base_temp - temps)
        return df

    @staticmethod
    def add_rolling_energy_features(
        df: pd.DataFrame,
        target_col: str = "grid_draw_kwh",
        windows: List[int] = [3, 6, 24]
    ) -> pd.DataFrame:
        """
        Computes rolling statistics (mean, std, max) over specified hourly lookback windows.
        """
        df = df.copy()
        if target_col in df.columns:
            series = pd.to_numeric(df[target_col], errors="coerce").bfill().ffill()
            for w in windows:
                df[f"{target_col}_roll_mean_{w}h"] = series.rolling(window=w, min_periods=1).mean()
                df[f"{target_col}_roll_std_{w}h"] = series.rolling(window=w, min_periods=1).std().fillna(0.0)
                df[f"{target_col}_roll_max_{w}h"] = series.rolling(window=w, min_periods=1).max()
        return df

    @staticmethod
    def add_lag_features(
        df: pd.DataFrame,
        target_col: str = "grid_draw_kwh",
        lags: List[int] = [1, 2, 24]
    ) -> pd.DataFrame:
        """
        Generates lag-shifted features for autoregressive models.
        """
        df = df.copy()
        if target_col in df.columns:
            for lag in lags:
                df[f"{target_col}_lag_{lag}h"] = df[target_col].shift(lag).bfill()
        return df

    @classmethod
    def transform_full_pipeline(cls, df: pd.DataFrame) -> pd.DataFrame:
        """
        Executes end-to-end feature extraction for deep learning training and inference.
        """
        df = cls.add_cyclical_time_features(df)
        df = cls.add_degree_days(df)
        df = cls.add_rolling_energy_features(df)
        df = cls.add_lag_features(df)
        return df

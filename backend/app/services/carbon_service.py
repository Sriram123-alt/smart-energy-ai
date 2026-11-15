class CarbonService:
    @staticmethod
    def get_carbon_footprint_details(grid_kwh: float, solar_generation_kwh: float) -> dict:
        """
        grid_kwh: net grid draw today
        solar_generation_kwh: clean solar generation offset today
        """
        # grid intensity standard is 0.42 kg CO2 per kWh
        co2_emitted = grid_kwh * 0.42
        co2_offset = solar_generation_kwh * 0.45
        
        net_carbon = max(0.0, co2_emitted - co2_offset)
        
        # Equivalence conversion: 1 tree offset is ~0.06 kg per day
        equivalent_trees = co2_offset / 0.06
        
        # Car miles saved (1 mile is ~0.4 kg CO2)
        equivalent_car_miles = co2_offset / 0.4
        
        return {
            "emittedKg": round(co2_emitted, 2),
            "offsetKg": round(co2_offset, 2),
            "netCarbonKg": round(net_carbon, 2),
            "equivalentTrees": int(equivalent_trees),
            "carMilesSaved": round(equivalent_car_miles, 1)
        }

    @staticmethod
    def get_historical_carbon_data() -> dict:
        import os
        import pandas as pd
        from app.config.settings import settings

        file_path = os.path.join(settings.DATASETS_DIR, "carbon_emission_data.csv")
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            return {"status": "empty", "records": [], "count": 0}

        try:
            df = pd.read_csv(file_path)
            # Standardize numeric values
            if "Value" in df.columns:
                df["Value"] = pd.to_numeric(df["Value"], errors="coerce")
                df = df.dropna(subset=["Value"])
                
            records = df.head(100).to_dict(orient="records")
            latest_val = float(df["Value"].iloc[-1]) if not df.empty and "Value" in df.columns else 0.0
            avg_val = float(df["Value"].mean()) if not df.empty and "Value" in df.columns else 0.0

            return {
                "status": "processed",
                "count": len(df),
                "latestValue": round(latest_val, 2),
                "averageValue": round(avg_val, 2),
                "records": records
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}


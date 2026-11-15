class ReportService:
    @staticmethod
    def generate_report_preview(start_date: str, end_date: str) -> dict:
        """
        Generates simulated aggregation metrics for the custom report page
        """
        # Mock summary statistics matching the date window
        return {
            "period": f"{start_date} to {end_date}",
            "totalKwh": 384.2,
            "solarGeneratedKwh": 112.5,
            "gridImportKwh": 271.7,
            "totalCost": 62.80,
            "carbonSavedKg": 47.25,
            "applianceBreakdown": [
                {"name": "HVAC Cooling", "value": 45},
                {"name": "Water Heating", "value": 22},
                {"name": "Refrigeration", "value": 15},
                {"name": "EV Charger", "value": 10},
                {"name": "Lighting & Stands", "value": 8}
            ]
        }

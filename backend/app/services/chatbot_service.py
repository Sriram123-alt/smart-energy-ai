import time

class ChatbotService:
    @staticmethod
    def get_ai_response(query: str) -> dict:
        query_lower = query.lower()
        
        # Determine best response category
        if any(w in query_lower for w in ["bill", "cost", "save", "saving", "reduce"]):
            response = (
                "Based on your current load curve, your **Central Air Conditioner** is the largest cost "
                "contributor. Toggling it off during peak Time-of-Use periods (5 PM - 9 PM) or shifting "
                "the thermostat setting to 78°F will yield **$18.50 in monthly bill savings**. "
                "Check out the **Grid & Bill Estimator** tab to model more rate options!"
            )
        elif any(w in query_lower for w in ["solar", "sun", "panel", "generation", "green"]):
            response = (
                "Your solar panels are currently performing with high efficiency, offsetting about **80% of "
                "your active household load**. To maximize this green tariff benefit, I recommend running "
                "high-wattage appliances (like the EV Charger or Washing Machine) during peak sunlight hours "
                "(11 AM - 3 PM)."
            )
        elif any(w in query_lower for w in ["anomaly", "alert", "leak", "incident", "critical"]):
            response = (
                "I am monitoring 1 active **Standby Leakage** alert on your AC system. The system has "
                "detected a continuous 250W phantom draw during early morning hours. I recommend scheduling "
                "a maintenance check or using smart plugs to fully isolate the load when not in use."
            )
        elif any(w in query_lower for w in ["appliance", "smart", "device", "ac", "ev", "refrigerator"]):
            response = (
                "You have **6 connected smart appliances** online. Your Electric Vehicle Charger (7.2 kW) and "
                "Air Conditioner (3.5 kW) represent your largest potential peak demands. Shifting EV charging "
                "to overnight hours (11 PM - 6 AM) keeps you within optimal off-peak tariff thresholds."
            )
        else:
            response = (
                "Hello! I am your **Smart Energy AI Assistant**. I analyze your household load curves "
                "using deep learning models to predict monthly usage, flag anomalies, and optimize your utility "
                "bills. Feel free to ask me questions like 'How can I save on my electric bill?' or "
                "'Are there active anomalies in my grid?'"
            )
            
        return {
            "query": query,
            "response": response,
            "timestamp": time.strftime("%H:%M")
        }

import apiClient from "./apiClient";

const RESPONSES = {
  ac: "Your smart air conditioner is currently drawing about 1.6 kW. Based on your usage, raising the thermostat setting by just 2°F (from 70°F to 72°F) will decrease your daily cooling costs by approximately 10%. You can manage this dynamically under the 'Smart Appliances' tab or run a simulation on the 'What-If Simulator' page.",
  solar: "You have a 4.0 kW solar panel system installed. In peak sunlight hours, it offsets up to 75% of your grid demand and feeds excess energy back to the utility. Upgrading solar capacity to 6.0 kW would save an estimated additional $38.50 per month on delivery fees and taxes.",
  bill: "Your projected bill for this month is $115.60. The primary drivers are peak AC usage (between 4:00 PM and 7:00 PM) and phantom appliance standby loads. You can lower this projection by implementing recommendations like scheduling laundry after 9:00 PM.",
  anomaly: "I detected 1 Critical anomaly regarding your Smart Air Conditioner: it ran at full capacity (2.2 kW) between 2:00 AM and 4:30 AM while outdoors was a cool 65°F. Please ensure all windows were shut or verify if your AC filter needs cleaning to ensure optimal airflow.",
  ev: "Your Tesla EV Charger is currently OFF. Charging is scheduled for off-peak hours (12:00 AM - 6:00 AM) to take advantage of the lower rate ($0.11/kWh instead of the peak rate of $0.32/kWh). Charging now would add roughly $8.50 to your bill.",
  help: "I am your Smart Energy AI. You can ask me questions like:\n- 'How can I save money on my electric bill?'\n- 'Are there any energy anomalies?'\n- 'How much carbon offset does my solar provide?'\n- 'What is my projected bill?'"
};

export const chatbotService = {
  sendMessage: async (message) => {
    try {
      const res = await apiClient.post("/chatbot", { query: message });
      const raw = res.data;
      return {
        text: raw.response,
        sender: "ai",
        timestamp: raw.timestamp
      };
    } catch (e) {
      console.warn("Backend chatbot API unavailable, using local mock", e);
      return new Promise((resolve) => {
        setTimeout(() => {
          const lowerMsg = message.toLowerCase();
          let reply;

          if (lowerMsg.includes("ac") || lowerMsg.includes("air cond") || lowerMsg.includes("thermostat") || lowerMsg.includes("cool")) {
            reply = RESPONSES.ac;
          } else if (lowerMsg.includes("solar") || lowerMsg.includes("sun") || lowerMsg.includes("panel")) {
            reply = RESPONSES.solar;
          } else if (lowerMsg.includes("bill") || lowerMsg.includes("cost") || lowerMsg.includes("money") || lowerMsg.includes("price")) {
            reply = RESPONSES.bill;
          } else if (lowerMsg.includes("anomaly") || lowerMsg.includes("alert") || lowerMsg.includes("warning") || lowerMsg.includes("spike")) {
            reply = RESPONSES.anomaly;
          } else if (lowerMsg.includes("ev") || lowerMsg.includes("car") || lowerMsg.includes("tesla") || lowerMsg.includes("charg")) {
            reply = RESPONSES.ev;
          } else {
            reply = `I analyzed your query: "${message}". Currently, your grid load is stable at ${((Math.random() * 2) + 1).toFixed(2)} kW. ${RESPONSES.help}`;
          }

          resolve({
            text: reply,
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 500);
      });
    }
  }
};
export default chatbotService;

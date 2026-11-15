import { useState, useRef, useEffect } from "react";
import { chatbotService } from "../services/chatbotService";

let messageCounter = 0;

export function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: "msg_init",
      text: "Hello! I am your Smart Energy AI Director. I monitor sensor telemetry, anomaly occurrences, solar outputs, and appliance configurations in real-time. Ask me questions like 'How can I save money on my AC?' or 'Check active anomalies'. How can I assist you today?",
      sender: "ai",
      timestamp: "12:00 PM"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputValue("");
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMsg = {
      id: `msg_user_${++messageCounter}`,
      text: text,
      sender: "user",
      timestamp: timeString
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(text);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg_ai_${++messageCounter}`,
        ...response
      }]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg_err_${++messageCounter}`,
        text: "Error contacting the Energy AI engine. Please retry.",
        sender: "ai",
        timestamp: timeString
      }]);
    }
  };

  const quickPrompts = [
    { text: "Check anomalies", query: "check active anomalies" },
    { text: "How to lower AC bill?", query: "how do I lower my AC bill?" },
    { text: "Am I grid independent?", query: "am I grid independent?" },
    { text: "Solar panels offset?", query: "how much carbon offset does my solar provide?" }
  ];

  return (
    <div className="flex-1 p-8 flex flex-col bg-[#0B0F19] h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Advisor</h1>
        <p className="text-slate-400 text-xs mt-1">Chat directly with the Smart Energy AI to debug active incident alerts or optimize infrastructure</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden">
        {/* Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed border relative shadow ${
                msg.sender === "user" 
                  ? "bg-slate-950 border-slate-800 text-slate-200 rounded-tr-none" 
                  : "bg-slate-900/40 border-slate-800/60 text-slate-300 rounded-tl-none"
              }`}>
                {/* Text content */}
                <p className="whitespace-pre-line">{msg.text}</p>
                {/* Meta details */}
                <span className="text-[9px] font-mono text-slate-550 block mt-2 text-right">
                  {msg.sender === "user" ? "You" : "Energy AI"} • {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 space-y-4 shrink-0">
          {/* Quick prompt pills */}
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-850 text-[10px] font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
              >
                {p.text}
              </button>
            ))}
          </div>

          {/* Typing box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about your home energy..."
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition text-xs font-medium"
            />
            <button
              type="submit"
              className="p-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;

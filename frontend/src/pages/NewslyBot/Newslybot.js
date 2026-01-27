import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, PlusCircle } from 'lucide-react';
import API from "../../api";
import './Newslybot.css';
import { RiVoiceprintFill } from "react-icons/ri";
import { Audio } from 'react-loader-spinner';

const Newslybot = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);


  // Auto-scroll logic
  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e, textToSend) => {
    if (e) e.preventDefault();
    
    const userQuery = textToSend ?? input; // use passed text, fallback to input
    if (!userQuery.trim() || isTyping) return;

    // 1. Add User Message to UI
    const userMsg = { role: 'user', content: userQuery };
    setMessages((prev) => [...prev, userMsg]);
    setInput(''); // clear input
    setIsTyping(true);

    try {
      // 2. Backend call
      const response = await API.post("/auth/ask", { query: userQuery });

      // 3. Add bot response to UI
      const botResponse = { role: 'bot', content: response.data.answer };
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: "I'm having trouble connecting right now. Try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    setIsRecording(true);
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setIsRecording(false);
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.webm");
      try {
        const res = await API.post("/news/stt", formData);
        const text = res.data.text;
        //console.log("Transcribed Text:", text);
        if (!text.trim()) return;

        setInput(text);
        // ✅ Send directly using text
        handleSend(null, text);

      } catch (err) {
        console.error("Voice to text failed:", err);
      }
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000);
  };

  /*useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (annyang) {
      // Define commands: wake word triggers a function
      const commands = {
        "hey newsly": () => {
          console.log("🎯 Wake word detected!");
          startRecording();
        },
      };

      // Add commands
      annyang.addCommands(commands);

      // Start listening
      annyang.start({
        autoRestart: true,  // restart automatically if stopped
        continuous: true,   // keep listening
      });

      // Optional: debug messages
      annyang.addCallback("error", (err) => console.error("Annyang error:", err));
      annyang.addCallback("resultNoMatch", (phrases) =>
        console.log("No match detected:", phrases)
      );
    } else {
      console.log("🚨 Browser does not support SpeechRecognition API");
    }
  }, []);
  */

  /*// Helper to clear chat
  const startNewChat = () => {
    setMessages([{ role: 'bot', content: 'Chat cleared. How else can I help?' }]);
  };*/

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-brand">
          <div className="bot-icon-wrapper">
            <Bot size={20} color="white" />
          </div>
          <h2>Newsly AI</h2>
        </div>
      </header>
      <main className="message-area">
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role}`}>
              <div className="avatar shadow-sm">
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="message-bubble shadow-sm">
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message-row bot animate-pulse">
              <div className="avatar shadow-sm">
                <Bot size={18} />
              </div>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </main>

      <footer className="input-area">
        <form className="input-wrapper" onSubmit={handleSend}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about news..."
            rows="1"
          />
          {isRecording ? (
            <Audio height="30" width="30" color="#4d4fa9" ariaLabel="listening" wrapperStyle={{ display: "inline-block", marginLeft: "10px", verticalAlign: "middle" }} visible={true} />
          ) : (
            <RiVoiceprintFill 
              className="voice_btn" 
              onClick={() => startRecording()}
              style={{ cursor: "pointer" }}
            />
          )}
        </form>
        <p className="disclaimer">Newsly AI can make mistakes. Verify important info.</p>
      </footer>
    </div>
  );
};

export default Newslybot;

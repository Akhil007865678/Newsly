import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, PlusCircle } from 'lucide-react';
import API from "../../api";
import './Newslybot.css';

const Newslybot = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userQuery = input.trim();
    
    // 1. Add User Message to UI
    const userMsg = { role: 'user', content: userQuery };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 2. Actual Backend Call
      const response = await API.post("/news/newsly", { query: userQuery });
      
      // 3. Add AI Response to UI
      const botResponse = { 
        role: 'bot', 
        content: response.data.answer 
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error("AI Error:", err);
      // 4. Handle Error in UI
      setMessages((prev) => [...prev, { 
        role: 'bot', 
        content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

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
            placeholder="Ask Newsly AI anything..."
            rows="1"
          />
          <button 
            type="submit" 
            className="send-btn" 
            disabled={!input.trim() || isTyping}
          >
            <Send size={18} />
          </button>
        </form>
        <p className="disclaimer">Newsly AI can make mistakes. Verify important info.</p>
      </footer>
    </div>
  );
};

export default Newslybot;
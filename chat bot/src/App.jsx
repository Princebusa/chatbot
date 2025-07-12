import { useState, useRef, useEffect } from "react";

// Simple AI avatar SVG component
function AIBotAvatar() {
  return (
    <div className="chatgpt-avatar">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="18" fill="#E6E6F0"/>
        <ellipse cx="18" cy="15" rx="7" ry="7" fill="#6C3FC5"/>
        <ellipse cx="18" cy="15" rx="3" ry="3" fill="#fff"/>
        <rect x="12" y="23" width="12" height="3" rx="1.5" fill="#6C3FC5"/>
      </svg>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([]); // {role: 'user'|'ai', content: string, sql?: string, code?: any[]}
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    const userMsg = { role: "user", content: question };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    setQuestion("");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      const aiMsg = {
        role: "ai",
        content: data?.aiResponse || "",
        sql: data?.sql,
        code: data?.data
      };
      setMessages((msgs) => [...msgs, aiMsg]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { role: "ai", content: "Sorry, something went wrong." }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="chatgpt-app minimalist">
      <div className="chatgpt-chat-window minimalist">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chatgpt-bubble minimalist ${msg.role === "user" ? "user" : "ai"}`}
          >
            {msg.role === "ai" && <AIBotAvatar />}
            <div className="chatgpt-bubble-content minimalist">
              {msg.content}
              {msg.sql && (
                <pre className="chatgpt-sql minimalist"><b>SQL:</b> {msg.sql}</pre>
              )}
              {msg.code && Array.isArray(msg.code) && (
                <pre className="chatgpt-code minimalist">
                  {msg.code.map((item, i) => {
                    const entries = Object.entries(item)
                      .map(([key, value]) => {
                        const formatted = typeof value === "string" ? `'${value}'` : value;
                        return `    ${key}: ${formatted}`;
                      })
                      .join(",\n");
                    return `  {\n${entries}\n  },\n`;
                  })}
                </pre>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chatgpt-bubble minimalist ai">
            <AIBotAvatar />
            <div className="chatgpt-bubble-content minimalist">
              <span className="chatgpt-typing minimalist">AI is typing<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form
        className="chatgpt-input-bar minimalist"
        onSubmit={e => { e.preventDefault(); handleAsk(); }}
      >
        <textarea
          className="chatgpt-input minimalist"
          placeholder="Send a message."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          type="submit"
          className="chatgpt-send-btn minimalist"
          disabled={loading || !question.trim()}
          aria-label="Send"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="14" fill="#23272f"/>
            <path d="M9 14L19 14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 10L19 14L15 18" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default App;

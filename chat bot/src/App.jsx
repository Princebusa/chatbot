import { useState, useRef, useEffect } from "react";

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
    <div className="chatgpt-app">
      <h1 className="chatgpt-title">Ask Your Database</h1>
      <div className="chatgpt-chat-window">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chatgpt-bubble ${msg.role === "user" ? "user" : "ai"}`}
          >
            <div className="chatgpt-bubble-content">
              {msg.content}
              {msg.sql && (
                <pre className="chatgpt-sql"><b>SQL:</b> {msg.sql}</pre>
              )}
              {msg.code && Array.isArray(msg.code) && (
                <pre className="chatgpt-code">
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
          <div className="chatgpt-bubble ai">
            <div className="chatgpt-bubble-content">
              <span className="chatgpt-typing">AI is typing<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form
        className="chatgpt-input-bar"
        onSubmit={e => { e.preventDefault(); handleAsk(); }}
      >
        <textarea
          className="chatgpt-input"
          placeholder="Ask something..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          type="submit"
          className="chatgpt-send-btn"
          disabled={loading || !question.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;

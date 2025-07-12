import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(null);

  const handleAsk = async () => {
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await res.json();
    setCode(data.data)
    setResponse(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Ask Your Database</h1>
      <input
        type="text"
        placeholder="Ask something..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ padding: "0.5rem", width: "300px" }}
      />
      <button onClick={handleAsk} style={{ marginLeft: "1rem", padding: "0.5rem" }}>
        Ask
      </button>

      {loading && <p>Loading...</p>}

      {response && (
        <pre style={{ background: "#f0f0f0", marginTop: "1rem", padding: "1rem" }}>
          <p>{response?.aiResponse}</p>
           <p><b>{response.sql ? "SQL:" : ""} </b>{response.sql}</p>
          <code>
        
        {code?.map((item) => {
          const entries = Object.entries(item)
            .map(([key, value]) => {
              const formatted =
                typeof value === "string" ? `'${value}'` : value;
              return `    ${key}: ${formatted}`;
            })
            .join(",\n");
          return `  {\n${entries}\n  },\n`;
        })}
    
      </code>
         
        </pre>
      )}
    </div>
  );
}

export default App;

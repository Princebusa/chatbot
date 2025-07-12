const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config()


const app = express();

app.use(cors({
  origin: "https://chatbot-nu-bice.vercel.app", 
  credentials: true 
}));
// app.use(cors());
app.use(express.json());

app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  try {
    const response = await fetch("https://www.askyourdatabase.com/api/ask/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.api}`
      },
      body: JSON.stringify({
        question,
        chatbotid: "e21ba19d72b964c83b1d488fcbbcfb78",
        returnAll: false
      })
    });

    const data = await response.json();
    res.json(data);
console.log(data)
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

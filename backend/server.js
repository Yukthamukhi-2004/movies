import "dotenv/config";
import express from "express";
import Groq from "groq-sdk";

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Manual CORS — no cors package, handles everything
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight immediately
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "10mb" })); // movies data can be large

app.post("/api/shortlist", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content:
            "You are a movie recommendation engine. Always respond with valid JSON only. No markdown, no backticks, no explanation.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = response.choices[0].message.content.trim();
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.picks || parsed.picks.length === 0) {
      throw new Error("No picks returned from AI");
    }

    res.json(parsed);
  } catch (err) {
    console.error("Shortlist error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/test", (req, res) => {
  res.json({
    status: "Backend working!",
    groq: process.env.GROQ_API_KEY ? "YES" : "NO",
  });
});

console.log("Groq key loaded:", process.env.GROQ_API_KEY ? "YES" : "NO");
app.listen(3001, () => console.log("✅ Proxy running on port 3001"));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const TRAKT_API_URL = "https://api.trakt.tv/movies/popular?extended=full";
const TRAKT_CLIENT_ID =
  process.env.VITE_TRAKT_CLIENT_ID ||
  "d18ef90d359e1b16311df076556165adf10f332dbf2301436a7fd23a7b4de19b";

console.log("TRAKT_CLIENT_ID:", TRAKT_CLIENT_ID);

app.get("/api/movies", async (req, res) => {
  try {
    console.log("Fetching movies...");

    if (!TRAKT_CLIENT_ID) {
      return res.status(400).json({ error: "TRAKT_CLIENT_ID is not set" });
    }

    const response = await fetch(TRAKT_API_URL, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": TRAKT_CLIENT_ID,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    console.log("Trakt API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Trakt API error:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching Trakt movies:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch movies", message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const { LRUCache } = require("lru-cache");

const app = express();
const port = 3001;

// LRU cache 1 hour
const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 60,
});

app.use(cors());
app.use(express.json());

// POST: Shorten the URL
app.post("/shorten", (req, res) => {
  const { longUrl } = req.body;

  // Validate if longUrl exists
  if (!longUrl) return res.status(400).json({ error: "Long URL is required" });

  const regex = /^(https?:\/\/[^\/]+)/;
  const match = longUrl.match(regex);
  const baseUrl = match ? match[0] : "http://localhost:3001";  

  // Generate a unique short ID
  const shortId = nanoid(6);
  const shortUrl = `${baseUrl}/${shortId}`;

  // Store in the cache
  cache.set(shortId, longUrl);
  console.log("Cache Contents:", cache);  // Log cache contents

  res.json({ shortUrl, longUrl });
});

app.get("/urls", (req, res) => {
  const allUrls = [];
  const keys = Array.from(cache.keys());

  keys.forEach((key) => {
    const longUrl = cache.get(key);
    const baseUrl = `http://${req.headers.host}`;

    allUrls.push({
      shortUrl: `${baseUrl}/${key}`,
      longUrl: longUrl,
    });
  });

  res.json(allUrls);
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const express = require("express");
const axios = require("axios");
const router = express.Router();

const UPTIMEKUMA_URL =
  process.env.UPTIMEKUMA_URL || "https://uptime.packjack.dev";
const UPTIMEKUMA_API_KEY = process.env.UPTIMEKUMA_API_KEY;

let cachedStatus = null;
let lastFetch = 0;
const CACHE_DURATION = 10000; // 10 seconds

router.get("/uptime-status", async (req, res) => {
  try {
    if (cachedStatus && Date.now() - lastFetch < CACHE_DURATION) {
      return res.json(cachedStatus);
    }

    const response = await axios.get(`${UPTIMEKUMA_URL}/metrics`, {
      auth: UPTIMEKUMA_API_KEY
        ? { username: "", password: UPTIMEKUMA_API_KEY }
        : undefined,
    });

    const lines = response.data.split("\n");
    const monitors = [];

    lines.forEach((line) => {
      if (line.startsWith("monitor_status")) {
        const match = line.match(/monitor_name="([^"]+)".*} (\d)/);
        if (match) {
          const name = match[1];
          const status = parseInt(match[2]);
          monitors.push({ name, status });
        }
      }
    });

    cachedStatus = { monitors };
    lastFetch = Date.now();
    res.json(cachedStatus);
  } catch (err) {
    console.error("Uptime Kuma metrics error:", err.message);
    res
      .status(500)
      .json({ monitors: [], error: "Failed to fetch Uptime Kuma data" });
  }
});

module.exports = router;

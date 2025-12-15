const express = require("express");
const router = express.Router();

const viewers = new Map();

function cleanupStaleViewers() {
  const now = Date.now();
  for (const [id, lastSeen] of viewers.entries()) {
    if (now - lastSeen > 10000) {
      viewers.delete(id);
    }
  }
}

router.get("/count", (req, res) => {
  cleanupStaleViewers();
  res.json({ count: viewers.size });
});

router.post("/heartbeat", (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  viewers.set(sessionId, Date.now());
  cleanupStaleViewers();

  res.json({ count: viewers.size });
});

router.post("/disconnect", (req, res) => {
  const { sessionId } = req.body;

  if (sessionId) {
    viewers.delete(sessionId);
  }

  cleanupStaleViewers();
  res.json({ success: true, count: viewers.size });
});

module.exports = router;

const express = require("express");
const router = express.Router();

let currentActivities = {
  status: "coding",
  currentProject: "Personal Website",
  listeningTo: null,
  lastUpdated: Date.now(),
};

router.get("/", (req, res) => {
  res.json(currentActivities);
});

router.put("/", (req, res) => {
  currentActivities = {
    ...currentActivities,
    ...req.body,
    lastUpdated: Date.now(),
  };
  res.json(currentActivities);
});

router.get("/music", (req, res) => {
  res.json({
    currentlyPlaying: null,
    message: "Navidrome integration not yet implemented",
  });
});

router.get("/github", (req, res) => {
  res.json({
    recentActivity: [],
    message: "GitHub integration not yet implemented",
  });
});

module.exports = router;

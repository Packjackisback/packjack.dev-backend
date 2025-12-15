const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const VIEWS_FILE = path.join(__dirname, "../data/pageviews.json");

function initStorage() {
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(VIEWS_FILE)) {
    fs.writeFileSync(VIEWS_FILE, JSON.stringify({ total: 0, pages: {} }));
  }
}

function readViews() {
  try {
    const data = fs.readFileSync(VIEWS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { total: 0, pages: {} };
  }
}

function writeViews(data) {
  fs.writeFileSync(VIEWS_FILE, JSON.stringify(data, null, 2));
}

initStorage();

router.get("/", (req, res) => {
  const views = readViews();
  res.json({ total: views.total });
});

router.get("/:page", (req, res) => {
  const views = readViews();
  const page = req.params.page;
  res.json({
    page,
    views: views.pages[page] || 0,
  });
});

router.post("/increment", (req, res) => {
  const { page = "home" } = req.body;
  const views = readViews();

  views.total = (views.total || 0) + 1;
  views.pages[page] = (views.pages[page] || 0) + 1;

  writeViews(views);

  res.json({
    total: views.total,
    pageViews: views.pages[page],
  });
});

module.exports = router;

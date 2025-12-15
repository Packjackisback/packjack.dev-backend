const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const viewersRouter = require("./routes/viewers");
const activitiesRouter = require("./routes/activities");
const pageviewsRouter = require("./routes/pageviews");
const lastfmRouter = require("./routes/lastfm");
const wakatimeRouter = require("./routes/wakatime");
const uptimeRouter = require("./routes/uptime.js");

app.use("/api/viewers", viewersRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/pageviews", pageviewsRouter);
app.use("/api/lastfm", lastfmRouter);
app.use("/api/wakatime", wakatimeRouter);
app.use("/api/uptime", uptimeRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3031;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

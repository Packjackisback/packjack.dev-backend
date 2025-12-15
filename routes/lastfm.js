const express = require("express");
const axios = require("axios");
const router = express.Router();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;
const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";

let cachedTrack = null;
let lastFetch = 0;
const CACHE_DURATION = 10000;

router.get("/now-playing", async (req, res) => {
  try {
    if (cachedTrack && Date.now() - lastFetch < CACHE_DURATION) {
      return res.json(cachedTrack);
    }

    if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
      return res.json({
        isPlaying: false,
        message: "Last.fm not configured",
      });
    }

    const response = await axios.get(LASTFM_API_URL, {
      params: {
        method: "user.getrecenttracks",
        user: LASTFM_USERNAME,
        api_key: LASTFM_API_KEY,
        format: "json",
        limit: 1,
      },
    });

    const tracks = response.data.recenttracks?.track;
    if (!tracks || tracks.length === 0) {
      cachedTrack = { isPlaying: false };
      lastFetch = Date.now();
      return res.json(cachedTrack);
    }

    const track = Array.isArray(tracks) ? tracks[0] : tracks;
    const isPlaying = track["@attr"]?.nowplaying === "true";

    cachedTrack = {
      isPlaying,
      track: {
        name: track.name,
        artist: track.artist["#text"] || track.artist,
        album: track.album["#text"] || track.album,
        image:
          track.image?.[3]?.[`#text`] || track.image?.[2]?.[`#text`] || null,
        url: track.url,
      },
      timestamp: isPlaying ? null : track.date?.uts,
    };

    lastFetch = Date.now();
    res.json(cachedTrack);
  } catch (error) {
    console.error("Last.fm API error:", error.message);
    res.status(500).json({
      isPlaying: false,
      error: "Failed to fetch Last.fm data",
    });
  }
});

router.get("/recent", async (req, res) => {
  try {
    if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
      return res.json({
        tracks: [],
        message: "Last.fm not configured",
      });
    }

    const limit = req.query.limit || 10;
    const response = await axios.get(LASTFM_API_URL, {
      params: {
        method: "user.getrecenttracks",
        user: LASTFM_USERNAME,
        api_key: LASTFM_API_KEY,
        format: "json",
        limit,
      },
    });

    const tracks = response.data.recenttracks?.track || [];
    const formattedTracks = (Array.isArray(tracks) ? tracks : [tracks]).map(
      (track) => ({
        name: track.name,
        artist: track.artist["#text"] || track.artist,
        album: track.album["#text"] || track.album,
        image: track.image?.[2]?.[`#text`] || null,
        url: track.url,
        timestamp: track.date?.uts || null,
        nowPlaying: track["@attr"]?.nowplaying === "true",
      }),
    );

    res.json({ tracks: formattedTracks });
  } catch (error) {
    console.error("Last.fm API error:", error.message);
    res.status(500).json({
      tracks: [],
      error: "Failed to fetch Last.fm data",
    });
  }
});

module.exports = router;

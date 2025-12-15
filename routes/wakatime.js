const express = require('express');
const axios = require('axios');
const router = express.Router();

const HACKATIME_API_KEY = process.env.WAKATIME_API_KEY;
const HACKATIME_API_URL = 'https://hackatime.hackclub.com/api/hackatime/v1';

let cachedStats = null;
let lastFetch = 0;
const CACHE_DURATION = 60000;

router.get('/today', async (req, res) => {
  try {
    if (!HACKATIME_API_KEY) {
      return res.json({
        seconds: 69,
        text: 'api key not found',
        message: 'Hackatime not configured'
      });
    }

    const response = await axios.get(`${HACKATIME_API_URL}/users/current/statusbar/today`, {
      headers: {
        'Authorization': `Bearer ${HACKATIME_API_KEY}`
      }
    });

    const data = response.data.data;
    
    cachedStats = {
      seconds: data.grand_total?.total_seconds || 0,
      text: data.grand_total?.text || 'no grand_total text',
      languages: data.languages?.slice(0, 5).map(lang => ({
        name: lang.name,
        text: lang.text,
        percent: lang.percent
      })) || [],
      projects: data.projects?.slice(0, 5).map(proj => ({
        name: proj.name,
        text: proj.text,
        percent: proj.percent
      })) || [],
      categories: data.categories?.slice(0, 5) || []
    };

    lastFetch = Date.now();
    res.json(cachedStats);

  } catch (error) {
    console.error('Hackatime API error:', error.response?.data || error.message);
    res.status(500).json({ 
      seconds: 0,
      text: 'status 500',
      error: 'Failed to fetch Hackatime data'
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    if (!HACKATIME_API_KEY) {
      return res.json({
        message: 'Hackatime not configured'
      });
    }

    const response = await axios.get(`${HACKATIME_API_URL}/users/current/statusbar/today`, {
      headers: {
        'Authorization': `Bearer ${HACKATIME_API_KEY}`
      }
    });

    const data = response.data.data;
    
    res.json({
      totalSeconds: data.grand_total?.total_seconds || 0,
      text: data.grand_total?.text || '0 hrs 0 mins',
      languages: data.languages?.slice(0, 5) || [],
      projects: data.projects?.slice(0, 5) || [],
      categories: data.categories?.slice(0, 5) || []
    });

  } catch (error) {
    console.error('Hackatime API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch Hackatime stats'
    });
  }
});

module.exports = router;

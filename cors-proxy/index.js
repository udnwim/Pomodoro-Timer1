const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
// const PORT = 5500;
const PORT = 3001;
const allowedOrigins = ['http://localhost:5500', 'https://udnwim.github.io', 'null']
const allowedHosts = ['zenquotes.io']

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(origin)
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } else {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  next();
});

// proxy route
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return res.status(403).json({ error: 'This host is not allowed' });
    }
    const response = await axios.get(targetUrl);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch target URL', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`CORS Proxy running at http://localhost:${PORT}`);
});
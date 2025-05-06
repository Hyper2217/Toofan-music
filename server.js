const express = require('express');
const path = require('path');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend HTML/CSS/JS from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MP3 Download Endpoint
app.get('/download-mp3', async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send('Invalid URL');

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    ytdl(videoURL, { filter: 'audioonly' }).pipe(res);
  } catch (err) {
    res.status(500).send('Error processing MP3 download');
  }
});

// MP4 Download Endpoint
app.get('/download-mp4', async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send('Invalid URL');

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    ytdl(videoURL, { filter: format => format.container === 'mp4' }).pipe(res);
  } catch (err) {
    res.status(500).send('Error processing MP4 download');
  }
});

// YouTube search API Endpoint
app.get('/search', async (req, res) => {
  const query = req.query.q;
  const apiKey = 'AIzaSyDZNdCryKjbaasYmIOdgCUzVYQhHojfuLU';
  
  if (!query) return res.status(400).send('Query parameter is required');

  try {
    const youtubeRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=40`);
    const data = await youtubeRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).send('Error fetching YouTube search results');
  }
});

// Fallback for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

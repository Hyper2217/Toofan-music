const express = require('express');
const path = require('path');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

const app = express();
const PORT = process.env.PORT || 3000;

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// MP3 Download with FFmpeg
app.get('/download-mp3', async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send('Invalid URL');

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    const stream = ytdl(videoURL, { filter: 'audioonly', quality: 'highestaudio' });

    ffmpeg(stream)
      .audioBitrate(128)
      .format('mp3')
      .on('error', err => {
        console.error('FFmpeg error:', err.message);
        res.status(500).send('Error processing MP3 download');
      })
      .pipe(res, { end: true });
  } catch (err) {
    console.error('MP3 Download Error:', err.message);
    res.status(500).send('Error processing MP3 download');
  }
});

// MP4 Download (combined audio/video)
app.get('/download-mp4', async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send('Invalid URL');

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');

    ytdl(videoURL, {
      quality: 'highestvideo',
      filter: format => format.container === 'mp4' && format.hasAudio && format.hasVideo
    }).pipe(res);
  } catch (err) {
    console.error('MP4 Download Error:', err.message);
    res.status(500).send('Error processing MP4 download');
  }
});

// YouTube search API
app.get('/search', async (req, res) => {
  const query = req.query.q;
  const apiKey = 'AIzaSyDZNdCryKjbaasYmIOdgCUzVYQhHojfuLU';

  if (!query) return res.status(400).send('Query parameter is required');

  try {
    const youtubeRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=40`);
    const data = await youtubeRes.json();
    res.json(data);
  } catch (err) {
    console.error('YouTube Search Error:', err.message);
    res.status(500).send('Error fetching YouTube search results');
  }
});

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

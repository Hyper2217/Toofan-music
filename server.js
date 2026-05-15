const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const yts = require('yt-search');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));


// =========================
// 🔍 SEARCH API (FIXED)
// =========================
app.get('/api/search', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  try {
    const result = await yts(q);

    const videos = result.videos.slice(0, 25).map(v => ({
      title: v.title,
      id: v.videoId,
      thumbnail: v.thumbnail,
      duration: v.timestamp,
      author: v.author.name,
      url: `https://www.youtube.com/watch?v=${v.videoId}`
    }));

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});


// =========================
// ⬇️ DOWNLOAD API (FIXED)
// =========================
const fs = require('fs');
const path = require('path');

app.get('/api/download', (req, res) => {
  const { id, format } = req.query;

  if (!id || !['mp3', 'mp4'].includes(format)) {
    return res.status(400).send('Invalid request');
  }

  const url = `https://www.youtube.com/watch?v=${id}`;
  const filePath = path.join(__dirname, `${id}.${format}`);

  const args = format === 'mp3'
    ? [
        url,
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '-o', filePath
      ]
    : [
        url,
        '-f', 'best[ext=mp4]',
        '-o', filePath
      ];

  const yt = spawn('yt-dlp', args);

  yt.on('close', () => {
    res.download(filePath, () => {
      fs.unlinkSync(filePath); // cleanup
    });
  });

  yt.on('error', (err) => {
    console.error(err);
    res.status(500).send('Download failed');
  });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
app.get('/api/preview', async (req, res) => {
  const { q } = req.query;

  if (!q) return res.status(400).json({ error: 'Missing query' });

  const result = await yts(q);

  const top = result.videos[0];

  if (!top) return res.status(404).json({ error: 'No song found' });

  res.json({
    title: top.title,
    id: top.videoId,
    previewUrl: `/api/download?id=${top.videoId}&format=mp3`
  });
});

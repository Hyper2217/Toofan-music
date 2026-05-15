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
app.get('/api/download', (req, res) => {
  const { id, format } = req.query;

  if (!id || !['mp3', 'mp4'].includes(format)) {
    return res.status(400).send('Invalid request');
  }

  const url = `https://www.youtube.com/watch?v=${id}`;

  const args = format === 'mp3'
    ? [
        '-f', 'bestaudio',
        '--no-playlist',
        '--extractaudio',
        '--audio-format', 'mp3',
        '-o', '-',
        url
      ]
    : [
        '-f', 'best[ext=mp4]',
        '--no-playlist',
        '-o', '-',
        url
      ];

  const yt = spawn('yt-dlp', args);

  res.setHeader(
    'Content-Type',
    format === 'mp3' ? 'audio/mpeg' : 'video/mp4'
  );

  yt.stdout.pipe(res);

  yt.stderr.on('data', data => {
    console.log('yt-dlp:', data.toString());
  });

  yt.on('error', (err) => {
    console.error('Spawn error:', err);
    res.status(500).end('Download failed');
  });

  yt.on('close', code => {
    console.log(`yt-dlp exited with code ${code}`);
  });
});


// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

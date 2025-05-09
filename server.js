const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const yts = require('yt-search');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

// Search API
app.get('/api/search', async (req, res) => {
  const q = req.query.q || '';
  const r = await yts(q);
  const videos = r.videos.slice(0, 8).map(v => ({
    id: v.videoId,
    title: v.title,
    thumbnail: v.thumbnail,
    url: `https://www.youtube.com/watch?v=${v.videoId}`
  }));
  res.json(videos);
});

// Download API
app.get('/api/download', (req, res) => {
  const { id, format } = req.query;
  if (!id || !['mp3', 'mp4'].includes(format)) return res.status(400).send('Invalid request');

  const yt = spawn('yt-dlp', [
    `https://www.youtube.com/watch?v=${id}`,
    '-o', '-',
    ...(format === 'mp3' ? ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3']
                          : ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4'])
  ]);

  res.setHeader('Content-Disposition', `attachment; filename="Toofan_${id}.${format}"`);
  res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
  yt.stdout.pipe(res);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

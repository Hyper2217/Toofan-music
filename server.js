const express = require('express');
const cors = require('cors');
const yts = require('yt-search');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/api/suggest', async (req, res) => {
  const q = req.query.q || '';
  const r = await yts(q);
  const suggestions = r.videos.slice(0, 5).map(v => v.title);
  res.json(suggestions);
});

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

app.get('/api/download', (req, res) => {
  const { id, format } = req.query;
  if (!id || !['mp3', 'mp4'].includes(format)) {
    return res.status(400).send('Invalid request');
  }

  const url = `https://www.youtube.com/watch?v=${id}`;
  const fileName = `toofan_download.${format}`;
  const yt = spawn('yt-dlp', [
    url,
    '-o', '-',
    ...(format === 'mp3'
      ? ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3']
      : ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4']),
  ]);

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
  yt.stdout.pipe(res);

  yt.stderr.on('data', (data) => console.error(`yt-dlp error: ${data}`));
  yt.on('close', code => console.log(`yt-dlp exited with code ${code}`));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

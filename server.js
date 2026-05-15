const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const yts = require('yt-search');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

// Search API
app.get('/api/download', (req, res) => {

  const { id, format } = req.query;

  if (!id || !['mp3', 'mp4'].includes(format)) {
    return res.status(400).send('Invalid request');
  }

  const url = `https://www.youtube.com/watch?v=${id}`;

  const args =
    format === 'mp3'
      ? [
          '-f',
          'bestaudio',
          '--no-playlist',
          '-o',
          '-',
          url
        ]
      : [
          '-f',
          'best[ext=mp4]',
          '--no-playlist',
          '-o',
          '-',
          url
        ];

  const yt = spawn('yt-dlp', args);

  res.setHeader(
    'Content-Type',
    format === 'mp3'
      ? 'audio/mpeg'
      : 'video/mp4'
  );

  yt.stdout.pipe(res);

  yt.stderr.on('data', data => {
    console.log(data.toString());
  });

  yt.on('close', code => {
    console.log(`yt-dlp exited with code ${code}`);
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

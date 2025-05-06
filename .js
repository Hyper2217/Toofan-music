const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();

app.use(cors());

app.get('/download-mp3', async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send('Invalid URL');

  res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
  ytdl(videoURL, { filter: 'audioonly' })
    .pipe(res);
});

app.get('/download-mp4', async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send('Invalid URL');

  res.header('Content-Disposition', 'attachment; filename="video.mp4"');
  ytdl(videoURL, { quality: 'highestvideo' })
    .pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

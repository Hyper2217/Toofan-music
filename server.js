const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/download-mp3', async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send('Invalid URL');

  res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
  ytdl(videoURL, { filter: 'audioonly' }).pipe(res);
});

app.get('/download-mp4', async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send('Invalid URL');

  res.header('Content-Disposition', 'attachment; filename="video.mp4"');
  ytdl(videoURL, { quality: 'highestvideo' }).pipe(res);
});

app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

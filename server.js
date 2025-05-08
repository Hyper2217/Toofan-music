const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const cors = require('cors');
const app = express();

ffmpeg.setFfmpegPath(ffmpegPath);

app.use(cors());

app.get('/api/download/mp3', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);

    const stream = ytdl(videoUrl, { quality: 'highestaudio' });

    ffmpeg(stream)
      .audioBitrate(128)
      .format('mp3')
      .on('error', err => {
        console.error(err);
        res.status(500).send('Conversion failed');
      })
      .pipe(res, { end: true });
  } catch (err) {
    res.status(500).send('Download error');
  }
});

app.get('/api/download/mp4', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);

    ytdl(videoUrl, {
      format: 'mp4',
      quality: 'highestvideo'
    }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('MP4 download failed');
  }
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});

const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-exec');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// Suggest endpoint using ytsearch (autocomplete simulation)
app.get('/api/suggest', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const result = await ytdlp(`ytsearch10:${query}`, {
      dumpSingleJson: true,
      flatPlaylist: true
    });

    const suggestions = result.entries.map(item => item.title);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: 'Suggestion error' });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const result = await ytdlp(`ytsearch10:${query}`, {
      dumpSingleJson: true,
      flatPlaylist: false
    });

    const videos = result.entries.map(video => ({
      id: video.id,
      title: video.title,
      url: video.url || `https://www.youtube.com/watch?v=${video.id}`,
      thumbnail: video.thumbnail,
    }));

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Download endpoint
app.get('/api/download', async (req, res) => {
  const id = req.query.id;
  const format = req.query.format || 'mp3';
  if (!id) return res.status(400).send('Missing video ID');

  const url = `https://www.youtube.com/watch?v=${id}`;
  const fileName = `Toofan_${id}.${format}`;
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  try {
    const process = ytdlp.exec(url, {
      format: format === 'mp3' ? 'bestaudio' : 'bestvideo+bestaudio',
      output: '-',
      audioFormat: 'mp3',
      audioQuality: 0,
      quiet: true
    });

    process.stdout.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Download error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

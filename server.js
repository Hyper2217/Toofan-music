const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow Cross-Origin Requests
app.use(cors());

// YouTube API Key
const API_KEY = 'AIzaSyDZNdCryKjbaasYmIOdgCUzVYQhHojfuLU';

// YouTube search function
async function searchYouTube(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${API_KEY}&type=video&maxResults=10`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url
    }));
  } catch (error) {
    console.error('Error fetching data from YouTube:', error);
    return [];
  }
}

// Search API endpoint
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  const results = await searchYouTube(query);
  res.json(results);
});

// Serve the static frontend if needed (Optional)
app.use(express.static('public')); // Make sure to place frontend files (HTML, CSS, JS) in the 'public' folder

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

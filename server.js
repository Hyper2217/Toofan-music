const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public")); // Optional if frontend is served here

app.get("/download-mp3", async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send("Invalid URL");

  const info = await ytdl.getInfo(videoURL);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

  res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
  ytdl(videoURL, {
    filter: "audioonly",
    quality: "highestaudio",
  }).pipe(res);
});

app.get("/download-mp4", async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) return res.status(400).send("Invalid URL");

  const info = await ytdl.getInfo(videoURL);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

  res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
  ytdl(videoURL, {
    quality: "highestvideo",
  }).pipe(res);
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

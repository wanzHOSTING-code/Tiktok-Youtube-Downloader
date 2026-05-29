export default async function handler(req, res) { const { url } = req.query;

if (!url) { return res.status(400).json({ status: false, error: "URL TikTok wajib diisi" }); }

try { // Resolve short link TikTok const response = await fetch(url, { method: "GET", redirect: "follow" });

const finalUrl = response.url || url;

// API TikWM
const api = await fetch(
  `https://www.tikwm.com/api/?url=${encodeURIComponent(finalUrl)}`
);

const data = await api.json();

if (!data || !data.data) {
  return res.status(500).json({
    status: false,
    error: "Gagal mengambil video"
  });
}

return res.status(200).json({
  status: true,
  title: data.data.title,
  author: data.data.author?.nickname,
  cover: data.data.cover,
  music: data.data.music,
  video: data.data.play,
  video_hd: data.data.hdplay
});

} catch (err) { return res.status(500).json({ status: false, error: err.message }); } }

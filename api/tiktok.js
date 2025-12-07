export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL missing' });

  try {
    // resolve redirect for short links
    const r = await fetch(url, { method: 'GET', redirect: 'follow' });
    const finalUrl = r.url || url;

    const apiRes = await fetch(
      `https://tiktok-video-downloader-api.p.rapidapi.com/media?videoUrl=${encodeURIComponent(finalUrl)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com',
          'x-rapidapi-key': '3e12ed444fmsh5e4928099ff7e2ep168ae3jsn3e8ada08b03e'
        }
      }
    );

    const data = await apiRes.json();
    if (!apiRes.ok) return res.status(500).json({ error: data });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}

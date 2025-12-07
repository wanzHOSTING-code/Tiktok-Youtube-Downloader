export default async function handler(req, res) {
  try {
    const videoUrl = req.query.url;

    if (!videoUrl) {
      return res.status(400).json({ error: "URL tidak ditemukan" });
    }

    // 1. Buka short link (vt.tiktok.com)
    const finalUrl = await resolveRedirect(videoUrl);

    // 2. Call API RapidAPI asli
    const apiRes = await fetch(
      `https://tiktok-video-downloader-api.p.rapidapi.com/media?videoUrl=${encodeURIComponent(finalUrl)}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "tiktok-video-downloader-api.p.rapidapi.com",
          "x-rapidapi-key": "3e12ed444fmsh5e4928099ff7e2ep168ae3jsn3e8ada08b03e",
        },
      }
    );

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(500).json({ error: "API Error", details: data });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server Error", details: err.message });
  }
}

// FUNCTION untuk membuka link short
async function resolveRedirect(url) {
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
  });

  return res.url; // URL akhir setelah redirect
}

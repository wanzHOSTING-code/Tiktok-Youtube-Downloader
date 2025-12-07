export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // STEP 1 — Search video (HTTPS ✓)
    const search = await fetch("https://api.yt5s.io/api/ajaxSearch/index", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: new URLSearchParams({
        q: url,
        vt: "mp4"
      })
    });

    const data = await search.json();

    if (!data.vid) {
      return res.status(500).json({ error: "Video not found" });
    }

    // Ambil kualitas terbaik
    const key =
      data.links?.mp4?.["137"]?.k || // 1080p
      data.links?.mp4?.["22"]?.k ||  // 720p
      data.links?.mp4?.["18"]?.k;    // fallback 360p

    // STEP 2 — Convert to direct URL
    const convert = await fetch("https://api.yt5s.io/api/ajaxConvert/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: new URLSearchParams({
        vid: data.vid,
        k: key
      })
    });

    const file = await convert.json();

    return res.status(200).json({
      title: data.title,
      thumbnail: data.thumbnail,
      downloadUrl: file.dlink,
      quality: file.fquality || "default",
      size: file.fsize || "unknown"
    });

  } catch (e) {
    return res.status(500).json({ error: "YouTube API error", detail: e.message });
  }
}

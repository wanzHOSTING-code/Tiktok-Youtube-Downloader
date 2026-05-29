export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      error: 'URL missing'
    });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    });

    const finalUrl = response.url || url;

    const api = await fetch(
      `https://www.tikwm.com/api/?url=${encodeURIComponent(finalUrl)}`
    );

    const data = await api.json();

    return res.status(200).json({
      cover: data.data.cover,
      description: data.data.title,
      author: {
        nickname: data.data.author?.nickname || 'TikTok User'
      },
      downloadUrl: data.data.play,
      hd: data.data.hdplay,
      music: data.data.music
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

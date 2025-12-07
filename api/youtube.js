export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if(!url) return res.status(400).json({ error: 'URL required' });

    const apiUrl = 'https://p.oceansaver.in/api/youtube?url=' + encodeURIComponent(url);
    const r = await fetch(apiUrl);
    if(!r.ok) return res.status(502).json({ error: 'YouTube public API error' });
    const data = await r.json();

    // normalize into { title, thumbnail, author, video: [{quality, url}], audio: [{quality, url}] }
    const out = { title: data.title || data.meta?.title || '', thumbnail: data.thumbnail || data.image || '', author: data.author || data.uploader || '' };
    out.video = [];
    out.audio = [];
    if(Array.isArray(data.video)) data.video.forEach(v=>{ if(v.url) out.video.push({quality: v.quality || v.quality_name || v.format || 'video', url: v.url}); });
    if(Array.isArray(data.audio)) data.audio.forEach(a=>{ if(a.url) out.audio.push({quality: a.quality || a.format || 'audio', url: a.url}); });

    // fallback: if data.formats present
    if(out.video.length===0 && Array.isArray(data.formats)){
      data.formats.forEach(f=>{ if(f.url) out.video.push({quality: f.quality || f.qualityLabel || 'video', url: f.url}); });
    }

    return res.status(200).json(out);
  } catch (err) {
    return res.status(500).json({ error: 'YouTube server error', detail: err.message });
  }
}

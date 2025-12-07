export default async function handler(req, res) {
  const { url } = req.query;
  if(!url) return res.status(400).json({ error: 'URL required' });

  try {
    // Use public yt.jayvii.de API
    const apiRes = await fetch('https://yt.jayvii.de/api/info?url=' + encodeURIComponent(url));
    if(!apiRes.ok) return res.status(502).json({ error: 'YouTube public API error' });
    const data = await apiRes.json();

    // normalize formats: prefer direct url fields
    const out = [];
    if(Array.isArray(data.formats) && data.formats.length){
      data.formats.forEach(f=>{
        if(f.url) out.push({ quality: f.quality || f.qualityLabel || f.label || f.format || 'unknown', url: f.url });
      });
    }
    // fallback: check "formats_list" or similar
    if(out.length===0 && Array.isArray(data.formats_list)){
      data.formats_list.forEach(f=>{
        if(f.url) out.push({ quality: f.quality || f.label || 'unknown', url: f.url });
      });
    }

    // If still empty, try pick from 'adaptiveFormats' or others
    if(out.length===0 && Array.isArray(data.adaptiveFormats)){
      data.adaptiveFormats.forEach(f=>{
        if(f.url) out.push({ quality: f.qualityLabel || f.quality || 'unknown', url: f.url });
      });
    }

    if(out.length===0){
      // some endpoints return "streams" with direct links
      if(data.streams && Array.isArray(data.streams)){
        data.streams.forEach(s=>{
          if(s.url) out.push({ quality: s.quality || s.label || 'unknown', url: s.url });
        });
      }
    }

    // finally, return normalized response
    return res.status(200).json({
      title: data.title || data.meta?.title || '',
      thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails.pop && data.thumbnails.pop().url) || '',
      author: data.author || data.meta?.author || '',
      formats: out
    });

  } catch (err) {
    return res.status(500).json({ error: 'YouTube server error', detail: err.message });
  }
}

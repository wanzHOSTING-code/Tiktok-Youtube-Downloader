export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) return res.status(400).json({ error: "URL tidak boleh kosong." });

    try {
        const r = await fetch(
            `https://tiktok-video-downloader-api.p.rapidapi.com/media?videoUrl=${encodeURIComponent(url)}`,
            {
                method: "GET",
                headers: {
                    "x-rapidapi-host": "tiktok-video-downloader-api.p.rapidapi.com",
                    "x-rapidapi-key": "3e12ed444fmsh5e4928099ff7e2ep168ae3jsn3e8ada08b03e"
                }
            }
        );

        const data = await r.json();
        if (!r.ok) return res.status(500).json({ error: data });

        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: "Server Error", detail: err.message });
    }
}

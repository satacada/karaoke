import yts from 'yt-search';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query.q;
  const filter = req.query.filter || 'all';

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
  }

  try {
    let finalSearchTerm = query.trim();
    const lower = finalSearchTerm.toLowerCase();

    if (filter === 'karaoke') {
      const hasKeywords = lower.includes('karaoke') || lower.includes('letra') || lower.includes('instrumental') || lower.includes('lyrics') || lower.includes('pista');
      if (!hasKeywords) finalSearchTerm = `${finalSearchTerm} karaoke`;
    } else if (filter === 'official') {
      if (!lower.includes('oficial') && !lower.includes('official') && !lower.includes('video')) {
        finalSearchTerm = `${finalSearchTerm} official video`;
      }
    } else if (filter === 'live') {
      if (!lower.includes('vivo') && !lower.includes('live') && !lower.includes('acustico') && !lower.includes('acoustic')) {
        finalSearchTerm = `${finalSearchTerm} en vivo live`;
      }
    }

    const searchResults = await yts(finalSearchTerm);
    const rawVideos = searchResults.videos || [];

    const results = rawVideos
      .filter((v) => v.seconds > 30 && v.seconds <= 900)
      .slice(0, 20)
      .map((v) => {
        const titleLower = v.title.toLowerCase();
        let versionType = 'general';
        if (titleLower.includes('karaoke') || titleLower.includes('letra') || titleLower.includes('lyrics') || titleLower.includes('instrumental')) {
          versionType = 'karaoke';
        } else if (titleLower.includes('official') || titleLower.includes('oficial')) {
          versionType = 'official';
        } else if (titleLower.includes('live') || titleLower.includes('en vivo') || titleLower.includes('acústico') || titleLower.includes('acoustic')) {
          versionType = 'live';
        }

        return {
          videoId: v.videoId,
          title: v.title,
          author: v.author ? v.author.name : 'Desconocido',
          thumbnail: v.thumbnail,
          thumbnailUrl: v.thumbnail,
          durationSeconds: v.seconds,
          durationText: v.timestamp,
          views: v.views,
          versionType,
        };
      });

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json({ results });
  } catch (err) {
    console.error('Error searching YouTube on Vercel:', err);
    return res.status(500).json({ error: 'Error al buscar en YouTube', details: err.message });
  }
}

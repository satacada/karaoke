import yts from 'yt-search';
import { getGenreArtists } from './genreDefinitions.js';

function normalizeVideo(v) {
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
}

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
    const cleanQuery = query.trim();
    const genreArtists = getGenreArtists(cleanQuery);
    let rawVideos = [];

    if (genreArtists && genreArtists.length > 0) {
      const searchPromises = genreArtists.slice(0, 5).map(async (artist) => {
        let term = `${artist} exitos`;
        if (filter === 'karaoke') term = `${artist} karaoke letra`;
        else if (filter === 'official') term = `${artist} video oficial`;
        else if (filter === 'live') term = `${artist} en vivo live`;

        try {
          const r = await yts(term);
          return (r.videos || []).filter((v) => v.seconds >= 90 && v.seconds <= 480).slice(0, 3);
        } catch {
          return [];
        }
      });

      const artistResults = await Promise.all(searchPromises);
      const seenIds = new Set();
      for (const group of artistResults) {
        for (const v of group) {
          if (!seenIds.has(v.videoId)) {
            seenIds.add(v.videoId);
            rawVideos.push(v);
          }
        }
      }
    }

    if (rawVideos.length === 0) {
      let finalSearchTerm = cleanQuery;
      const lower = cleanQuery.toLowerCase();

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
      const vids = searchResults.videos || [];
      rawVideos = vids.filter((v) => v.seconds > 30 && v.seconds <= 900);
    }

    const results = rawVideos.slice(0, 20).map(normalizeVideo);
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json({ results });
  } catch (err) {
    console.error('Error searching YouTube on Vercel:', err);
    return res.status(500).json({ error: 'Error al buscar en YouTube', details: err.message });
  }
}

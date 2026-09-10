import yts from 'yt-search';
import { findRelatedArtists, interleaveArtistResults } from './genreDefinitions.js';

// Memoria caché para búsquedas recientes (30 minutos de TTL)
const searchCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

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
    versionType
  };
}

/**
 * Busca videos en YouTube optimizados para Karaoke o Rockola con soporte inteligente de géneros
 */
export async function searchYouTubeVideos(query, filterOrKaraokeOnly = 'karaoke') {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return [];
  }

  const cleanQuery = query.trim();
  let filter = 'all';
  if (typeof filterOrKaraokeOnly === 'boolean') {
    filter = filterOrKaraokeOnly ? 'karaoke' : 'all';
  } else if (typeof filterOrKaraokeOnly === 'string') {
    filter = filterOrKaraokeOnly.toLowerCase();
  }

  const cacheKey = `${cleanQuery.toLowerCase()}_${filter}`;
  const cached = searchCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.results;
  }

  const genreArtists = findRelatedArtists(cleanQuery);
  let rawVideos = [];

  if (genreArtists && genreArtists.length > 0) {
    const searchPromises = genreArtists.slice(0, 6).map(async (artist) => {
      let term = `${artist} exitos`;
      if (filter === 'karaoke') term = `${artist} karaoke letra`;
      else if (filter === 'official') term = `${artist} video oficial`;
      else if (filter === 'live') term = `${artist} en vivo live`;

      try {
        const r = await yts(term);
        return (r.videos || []).filter(v => v.seconds >= 90 && v.seconds <= 480).slice(0, 3);
      } catch {
        return [];
      }
    });

    const artistResults = await Promise.all(searchPromises);
    rawVideos = interleaveArtistResults(artistResults);
  }

  if (rawVideos.length === 0) {
    let finalSearchTerm = cleanQuery;
    const lower = cleanQuery.toLowerCase();

    if (filter === 'karaoke') {
      const hasKaraokeKeywords = lower.includes('karaoke') || lower.includes('letra') || lower.includes('instrumental') || lower.includes('lyrics') || lower.includes('pista');
      if (!hasKaraokeKeywords) finalSearchTerm = `${cleanQuery} karaoke`;
    } else if (filter === 'official') {
      if (!lower.includes('oficial') && !lower.includes('official') && !lower.includes('video')) {
        finalSearchTerm = `${cleanQuery} official video`;
      }
    } else if (filter === 'live') {
      if (!lower.includes('vivo') && !lower.includes('live') && !lower.includes('acustico') && !lower.includes('acoustic')) {
        finalSearchTerm = `${cleanQuery} en vivo live`;
      }
    }

    const searchResults = await yts(finalSearchTerm);
    const vids = searchResults.videos || [];
    rawVideos = vids.filter(v => v.seconds > 30 && v.seconds <= 900);
  }

  const filteredVideos = rawVideos.slice(0, 20).map(normalizeVideo);

  searchCache.set(cacheKey, {
    timestamp: Date.now(),
    results: filteredVideos
  });

  if (searchCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of searchCache.entries()) {
      if (now - v.timestamp > CACHE_TTL_MS) searchCache.delete(k);
    }
  }

  return filteredVideos;
}

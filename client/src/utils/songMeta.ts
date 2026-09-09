// ==============================================================================
// UTILIDAD: CODIFICACIÓN Y PARSEO DE METADATOS DE CANCIÓN (DEDICATORIAS Y VIP)
// Archivo: client/src/utils/songMeta.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { QueueItem } from '../types';

export interface SongMetaParsed {
  dedication: string | null;
  isVip: boolean;
  cleanThumbnail: string | null;
}

export function encodeSongThumbnail(
  originalUrl: string | null | undefined,
  meta: { dedication?: string | null; isVip?: boolean }
): string | null {
  if (!originalUrl && !meta.dedication && !meta.isVip) return null;
  const baseUrl = originalUrl || 'https://i.ytimg.com/vi/default/hqdefault.jpg';
  const params = new URLSearchParams();

  if (meta.dedication?.trim()) {
    params.set('d', meta.dedication.trim());
  }
  if (meta.isVip) {
    params.set('vip', '1');
  }

  const query = params.toString();
  return query ? `${baseUrl}#${query}` : baseUrl;
}

export function parseSongMeta(song: QueueItem): SongMetaParsed {
  // 1. Priorizar campos nativos si existen
  let dedication: string | null = song.dedication || null;
  let isVip = Boolean(song.is_vip);
  let cleanThumbnail = song.thumbnail_url;

  // 2. Extraer del hash de thumbnail_url si no estaban en columnas nativas
  if (song.thumbnail_url && song.thumbnail_url.includes('#')) {
    const [url, hash] = song.thumbnail_url.split('#');
    cleanThumbnail = url;
    try {
      const params = new URLSearchParams(hash);
      if (!dedication && params.has('d')) {
        dedication = params.get('d');
      }
      if (!isVip && params.get('vip') === '1') {
        isVip = true;
      }
    } catch {
      // Ignorar error de parseo de URL
    }
  }

  return { dedication, isVip, cleanThumbnail };
}

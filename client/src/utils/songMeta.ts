// ==============================================================================
// UTILIDAD: CODIFICACIÓN Y PARSEO DE METADATOS DE CANCIÓN (DEDICATORIAS Y VIP)
// Archivo: client/src/utils/songMeta.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { QueueItem } from '../types';

export interface SongMetaParsed {
  dedication: string | null;
  isVip: boolean;
  vipAmount: number;
  cleanThumbnail: string | null;
}

export function encodeSongThumbnail(
  originalUrl: string | null | undefined,
  meta: { dedication?: string | null; isVip?: boolean; vipAmount?: number }
): string | null {
  if (!originalUrl && !meta.dedication && !meta.isVip && !meta.vipAmount) return null;
  const baseUrl = originalUrl || 'https://i.ytimg.com/vi/default/hqdefault.jpg';
  const params = new URLSearchParams();

  if (meta.dedication?.trim()) {
    params.set('d', meta.dedication.trim());
  }
  if (meta.isVip || (meta.vipAmount && meta.vipAmount > 0)) {
    params.set('vip', '1');
    if (meta.vipAmount && meta.vipAmount > 0) {
      params.set('amt', meta.vipAmount.toString());
    }
  }

  const query = params.toString();
  return query ? `${baseUrl}#${query}` : baseUrl;
}

export function parseSongMeta(song: QueueItem): SongMetaParsed {
  let dedication: string | null = song.dedication || null;
  let isVip = Boolean(song.is_vip);
  let vipAmount = song.vip_amount || 0;
  let cleanThumbnail = song.thumbnail_url;

  if (song.thumbnail_url && song.thumbnail_url.includes('#')) {
    const [url, hash] = song.thumbnail_url.split('#');
    cleanThumbnail = url;
    try {
      const params = new URLSearchParams(hash);
      if (!dedication && params.has('d')) dedication = params.get('d');
      if (!isVip && params.get('vip') === '1') isVip = true;
      if (!vipAmount && params.has('amt')) vipAmount = parseInt(params.get('amt') || '0', 10) || 0;
    } catch {}
  }

  if (isVip && vipAmount === 0) vipAmount = 500;
  return { dedication, isVip, vipAmount, cleanThumbnail };
}

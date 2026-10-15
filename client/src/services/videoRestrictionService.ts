// ==============================================================================
// SERVICIO DE FILTRADO Y VALIDACIÓN DE RESTRICCIONES DE YOUTUBE
// Archivo: client/src/services/videoRestrictionService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

const RESTRICTED_KEY = 'karaoke_restricted_video_ids';

export function getRestrictedVideoIds(): string[] {
  try {
    const raw = localStorage.getItem(RESTRICTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRestrictedVideoId(videoId: string): void {
  if (!videoId) return;
  try {
    const list = getRestrictedVideoIds().filter((id) => id !== videoId);
    list.unshift(videoId);
    localStorage.setItem(RESTRICTED_KEY, JSON.stringify(list.slice(0, 300)));
  } catch {}
}

export function isVideoRestricted(videoId: string): boolean {
  if (!videoId) return true;
  return getRestrictedVideoIds().includes(videoId);
}

export async function isVideoEmbeddable(videoId: string): Promise<boolean> {
  if (!videoId || isVideoRestricted(videoId)) return false;
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, { method: 'GET', mode: 'cors' });
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      recordRestrictedVideoId(videoId);
      return false;
    }
    return res.ok;
  } catch {
    return true;
  }
}

// ==============================================================================
// BANCO CONSOLIDADO DE CANCIONES AUTO-DJ & ROTACIÓN
// Archivo: client/src/services/autoDjFallbacks.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { SearchResultItem } from '../types';
import { BAILABLES_CATALOG } from './autoDjCatalogBailables';
import { ROCK_POP_CATALOG } from './autoDjCatalogRockPop';
import { CLASICOS_CATALOG } from './autoDjCatalogClasicos';

export interface FallbackTrack {
  videoId: string;
  title: string;
  author: string;
  durationSeconds: number;
  durationText: string;
  thumbnailUrl: string;
}

export const EMERGENCY_FALLBACKS: Record<string, FallbackTrack[]> = {
  ...BAILABLES_CATALOG,
  ...ROCK_POP_CATALOG,
  ...CLASICOS_CATALOG,
};

export function cleanGenre(genre?: string): string {
  if (!genre) return 'cumbia_fiesta';
  return genre.toLowerCase().replace('seed:', '').trim();
}

/**
 * Obtiene la lista de canciones iniciales para el género según la rotación del día.
 * Devuelve 3 temas curados para arrancar la jornada.
 */
export function getInitialTracksForRotation(genre?: string, rotationIndex = 0): FallbackTrack[] {
  const g = cleanGenre(genre);
  const list = EMERGENCY_FALLBACKS[g] || EMERGENCY_FALLBACKS.cumbia_fiesta;
  const startIdx = (rotationIndex * 3) % list.length;
  const selected = list.slice(startIdx, startIdx + 3);
  return selected.length > 0 ? selected : list.slice(0, 3);
}

/**
 * Obtiene un tema de emergencia aleatorio para el género, excluyendo los ya reproducidos.
 */
export function getFallbackTrack(
  genre?: string,
  recentArtists: string[] = [],
  excludedVideoIds: string[] = []
): SearchResultItem {
  const g = cleanGenre(genre);
  const list = EMERGENCY_FALLBACKS[g] || EMERGENCY_FALLBACKS.cumbia_fiesta;

  // Filtrar primero por IDs excluidos (historial de sesión + cola actual) y artistas recientes
  const available = list.filter((t) =>
    !excludedVideoIds.includes(t.videoId) &&
    !recentArtists.some((r) => r.toLowerCase().includes(t.author.toLowerCase()))
  );

  // Si se agotan por artista, relajar artista pero mantener exclusión estricta de videoId
  const pool = available.length > 0 ? available : list.filter((t) => !excludedVideoIds.includes(t.videoId));

  // Si se agotó todo el catálogo en una sesión muy larga, reiniciar con cualquier tema que no esté sonando
  const finalPool = pool.length > 0 ? pool : (list.filter((t) => !excludedVideoIds.slice(0, 1).includes(t.videoId)).length > 0 ? list.filter((t) => !excludedVideoIds.slice(0, 1).includes(t.videoId)) : list);

  const picked = finalPool[Math.floor(Math.random() * finalPool.length)] || list[0];
  return { ...picked, versionType: 'official' };
}

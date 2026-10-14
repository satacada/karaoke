// ==============================================================================
// SERVICIO DE ROTACIÓN DIARIA DE GÉNEROS AUTO-DJ
// Archivo: client/src/services/genreRotationService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

export interface GenreRotationRecord {
  rotationIndex: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  wasPlayed: boolean;     // Solo rota si sonó en el player
}

const STORAGE_KEY = 'karaoke_genre_rotation_v2';
const MAX_ROTATIONS = 4;

function getTodayString(): string {
  try {
    return new Date().toISOString().slice(0, 10);
  } catch {
    return '2026-10-14';
  }
}

function getAllRecords(): Record<string, GenreRotationRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllRecords(records: Record<string, GenreRotationRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

export function cleanGenreKey(genreId?: string): string {
  if (!genreId) return 'cumbia_fiesta';
  return genreId.toLowerCase().replace('seed:', '').trim();
}

/**
 * Obtiene el índice de rotación para un género en el día de hoy.
 * Si cambió de día:
 * - Si fue tocado (wasPlayed === true): avanza a la siguiente rotación y resetea wasPlayed a false.
 * - Si NO fue tocado: mantiene exactamente la misma rotación previa.
 */
export function getGenreRotationIndex(genreId?: string): number {
  const key = cleanGenreKey(genreId);
  const today = getTodayString();
  const records = getAllRecords();
  const rec = records[key];

  if (!rec) {
    records[key] = { rotationIndex: 0, lastActiveDate: today, wasPlayed: false };
    saveAllRecords(records);
    return 0;
  }

  if (rec.lastActiveDate !== today) {
    if (rec.wasPlayed) {
      rec.rotationIndex = (rec.rotationIndex + 1) % MAX_ROTATIONS;
      rec.wasPlayed = false;
    }
    rec.lastActiveDate = today;
    saveAllRecords(records);
  }

  return rec.rotationIndex;
}

/**
 * Marca que el género sonó efectivamente en el reproductor de TV.
 * Esto habilita que mañana rote a nuevos temas iniciales.
 */
export function markGenrePlayed(genreId?: string): void {
  const key = cleanGenreKey(genreId);
  const today = getTodayString();
  const records = getAllRecords();
  const rec = records[key] || { rotationIndex: 0, lastActiveDate: today, wasPlayed: false };

  rec.wasPlayed = true;
  rec.lastActiveDate = today;
  records[key] = rec;
  saveAllRecords(records);
}

/**
 * Consulta si un género ya fue utilizado hoy en el reproductor.
 */
export function isGenrePlayedToday(genreId?: string): boolean {
  const key = cleanGenreKey(genreId);
  const today = getTodayString();
  const records = getAllRecords();
  const rec = records[key];
  return Boolean(rec?.wasPlayed && rec.lastActiveDate === today);
}

// ==============================================================================
// SERVICIO DE BUFFER AUTO-DJ EN RAM (ZERO ESCRIBIR EN SUPABASE)
// Archivo: client/src/services/autoDjRamQueueService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { QueueItem, SearchResultItem } from '../types';
import { fetchNextAutoDjTrack } from './autoDjService';
import { getFallbackTrack, getInitialTracksForRotation } from './autoDjFallbacks';
import { getGenreRotationIndex, markGenrePlayed } from './genreRotationService';
import { getRestrictedVideoIds } from './videoRestrictionService';

const RAM_KEY = 'karaoke_autodj_ram_queue', PLAYED_KEY = 'karaoke_autodj_played_ids';
let memoryQueue: QueueItem[] = [];

export function getPlayedSessionIds(): string[] {
  try { const raw = sessionStorage.getItem(PLAYED_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

export function recordPlayedSessionId(videoId: string): void {
  try {
    const list = getPlayedSessionIds().filter((id) => id !== videoId); list.unshift(videoId);
    sessionStorage.setItem(PLAYED_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {}
}

export function getRamQueue(): QueueItem[] {
  if (memoryQueue.length > 0) return memoryQueue;
  try { const raw = sessionStorage.getItem(RAM_KEY); if (raw) memoryQueue = JSON.parse(raw); } catch {}
  return memoryQueue;
}

export function setRamQueue(queue: QueueItem[]): void {
  memoryQueue = queue;
  try { sessionStorage.setItem(RAM_KEY, JSON.stringify(queue)); } catch {}
}

export function dequeueRamSong(excludedVideoId?: string, genre?: string): QueueItem | null {
  const current = getRamQueue();
  if (current.length === 0) return null;
  const idx = excludedVideoId ? current.findIndex((s) => s.video_id !== excludedVideoId) : 0;
  if (idx === -1) { clearRamQueue(); return null; }
  const [next] = current.splice(idx, 1);
  setRamQueue(current);
  if (next?.video_id) { recordPlayedSessionId(next.video_id); if (genre) markGenrePlayed(genre); }
  return next;
}

export function clearRamQueue(): void {
  memoryQueue = [];
  try { sessionStorage.removeItem(RAM_KEY); } catch {}
}

export function trackToRamItem(track: SearchResultItem, roomId: string, _genre = ''): QueueItem {
  return {
    id: `ram_${track.videoId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    room_id: roomId, guest_id: null,
    video_id: track.videoId, title: track.title, author: track.author,
    thumbnail_url: track.thumbnailUrl, duration_seconds: track.durationSeconds, duration_text: track.durationText,
    requested_by: 'Auto-DJ (Música de Fiesta)', priority_order: 999, status: 'queued',
    requested_at: new Date().toISOString(), started_at: null, finished_at: null,
  };
}

export function initializeGenreRamQueue(roomId: string, genre: string): QueueItem[] {
  const rotIdx = getGenreRotationIndex(genre);
  const initial = getInitialTracksForRotation(genre, rotIdx);
  const queue = initial.map((t) => trackToRamItem({ ...t, versionType: 'official' }, roomId, genre));
  setRamQueue(queue);
  return queue;
}

export async function fetchDiverseRamTrack(roomId: string, genre: string, excludedIds: string[] = []): Promise<QueueItem> {
  const allExcluded = [...new Set([...getPlayedSessionIds(), ...getRestrictedVideoIds(), ...excludedIds])];
  try {
    const dyn = await fetchNextAutoDjTrack(genre, []);
    if (dyn && !allExcluded.includes(dyn.videoId)) return trackToRamItem(dyn, roomId, genre);
  } catch {}
  return trackToRamItem(getFallbackTrack(genre, [], allExcluded), roomId, genre);
}

export async function fetchDailySeedRamTrack(roomId: string, genre: string): Promise<QueueItem> {
  return fetchDiverseRamTrack(roomId, genre, []);
}

export async function replenishRamQueue(roomId: string, genre: string, targetBuffer = 3, currentlyPlayingId?: string): Promise<QueueItem[]> {
  let current = getRamQueue();
  const needed = Math.max(0, targetBuffer - current.length);
  if (needed === 0) return current;

  const played = getPlayedSessionIds(), restricted = getRestrictedVideoIds();
  const excluded = new Set([...played, ...restricted, ...current.map((c) => c.video_id), ...(currentlyPlayingId ? [currentlyPlayingId] : [])]);

  for (let i = 0; i < needed; i++) {
    const recentAuthors = current.map((c) => c.author);
    let added = false;
    try {
      const dynamicTrack = await fetchNextAutoDjTrack(genre, recentAuthors);
      if (dynamicTrack && !excluded.has(dynamicTrack.videoId)) {
        excluded.add(dynamicTrack.videoId); current.push(trackToRamItem(dynamicTrack, roomId, genre));
        added = true;
      }
    } catch {}

    if (!added) {
      const fb = getFallbackTrack(genre, recentAuthors, Array.from(excluded));
      if (fb && !excluded.has(fb.videoId)) {
        excluded.add(fb.videoId); current.push(trackToRamItem(fb, roomId, genre));
      }
    }
  }

  setRamQueue(current);
  return current;
}

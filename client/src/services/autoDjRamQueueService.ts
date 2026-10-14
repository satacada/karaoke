// ==============================================================================
// SERVICIO DE BUFFER AUTO-DJ EN RAM (ZERO ESCRIBIR EN SUPABASE)
// Archivo: client/src/services/autoDjRamQueueService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { QueueItem, SearchResultItem } from '../types';
import { fetchNextAutoDjTrack } from './autoDjService';
import { getFallbackTrack, getInitialTracksForRotation } from './autoDjFallbacks';
import { getGenreRotationIndex, markGenrePlayed } from './genreRotationService';

const RAM_KEY = 'karaoke_autodj_ram_queue', PLAYED_KEY = 'karaoke_autodj_played_ids';
let memoryQueue: QueueItem[] = [];

export function getPlayedSessionIds(): string[] {
  try { const raw = sessionStorage.getItem(PLAYED_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

export function recordPlayedSessionId(videoId: string): void {
  try {
    const list = getPlayedSessionIds().filter((id) => id !== videoId); list.unshift(videoId);
    sessionStorage.setItem(PLAYED_KEY, JSON.stringify(list.slice(0, 80)));
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
    requested_by: 'Auto-DJ (Ambiente RAM)', priority_order: 999, status: 'queued',
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
  const allExcluded = [...new Set([...getPlayedSessionIds(), ...excludedIds])];
  const fallback = getFallbackTrack(genre, [], allExcluded);
  return trackToRamItem(fallback, roomId, genre);
}

export async function fetchDailySeedRamTrack(roomId: string, genre: string): Promise<QueueItem> {
  return fetchDiverseRamTrack(roomId, genre, []);
}

export async function replenishRamQueue(roomId: string, genre: string, targetBuffer = 3, currentlyPlayingId?: string): Promise<QueueItem[]> {
  let current = getRamQueue();
  const needed = Math.max(0, targetBuffer - current.length);
  if (needed === 0) return current;

  const played = getPlayedSessionIds();
  for (let i = 0; i < needed; i++) {
    const excludedIds = [...new Set([...played, ...current.map((c) => c.video_id), ...(currentlyPlayingId ? [currentlyPlayingId] : [])])];
    const recentAuthors = current.map((c) => c.author);
    const fb = getFallbackTrack(genre, recentAuthors, excludedIds);
    current.push(trackToRamItem(fb, roomId, genre));
  }
  setRamQueue(current);

  const recentArtists = current.map((c) => c.author);
  fetchNextAutoDjTrack(genre, recentArtists).then((track) => {
    if (track && track.videoId !== currentlyPlayingId && !played.includes(track.videoId)) {
      const q = getRamQueue();
      if (q.length > 0 && !q.some((x) => x.video_id === track.videoId)) {
        q[q.length - 1] = trackToRamItem(track, roomId, genre);
        setRamQueue(q);
      }
    }
  }).catch(() => {});

  return current;
}

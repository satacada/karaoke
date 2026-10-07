// ==============================================================================
// SERVICIO DE BUFFER AUTO-DJ EN RAM (ZERO ESCRIBIR EN SUPABASE)
// Archivo: client/src/services/autoDjRamQueueService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { QueueItem, SearchResultItem } from '../types';
import { fetchNextAutoDjTrack, getFallbackTrack } from './autoDjService';
import { getDailySeedForGenre } from './dailySeedService';
import { searchVideos } from './karaokeApi';

const RAM_KEY = 'karaoke_autodj_ram_queue';
let memoryQueue: QueueItem[] = [];

export function getRamQueue(): QueueItem[] {
  if (memoryQueue.length > 0) return memoryQueue;
  try {
    const raw = sessionStorage.getItem(RAM_KEY);
    if (raw) memoryQueue = JSON.parse(raw);
  } catch {}
  return memoryQueue;
}

export function setRamQueue(queue: QueueItem[]): void {
  memoryQueue = queue;
  try { sessionStorage.setItem(RAM_KEY, JSON.stringify(queue)); } catch {}
}

export function dequeueRamSong(): QueueItem | null {
  const current = getRamQueue();
  if (current.length === 0) return null;
  const next = current.shift() || null;
  setRamQueue(current);
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

export async function fetchDailySeedRamTrack(roomId: string, genre: string): Promise<QueueItem> {
  const seed = getDailySeedForGenre(genre);
  try {
    const results = await searchVideos(seed.query, 'official');
    if (results && results.length > 0) {
      const best = results.find((v) => v.durationSeconds >= 120 && v.durationSeconds <= 390) || results[0];
      return trackToRamItem(best, roomId, genre);
    }
  } catch {}
  const fallback = getFallbackTrack(genre);
  return trackToRamItem(fallback, roomId, genre);
}

export async function replenishRamQueue(roomId: string, genre: string, targetBuffer = 3): Promise<QueueItem[]> {
  const current = getRamQueue();
  const needed = Math.max(0, targetBuffer - current.length);
  if (needed === 0) return current;

  // Si la cola en memoria está vacía, pre-cargar de inmediato para visualización instantánea en TV
  if (current.length === 0) {
    for (let i = 0; i < Math.min(needed, 2); i++) {
      const fb = getFallbackTrack(genre, current.map((c) => c.author));
      current.push(trackToRamItem(fb, roomId, genre));
    }
    setRamQueue(current);
  }

  const recentArtists = current.map((c) => c.author);
  for (let i = 0; i < needed; i++) {
    const track = await fetchNextAutoDjTrack(genre, recentArtists);
    if (track) {
      current.push(trackToRamItem(track, roomId, genre));
      recentArtists.push(track.author);
      setRamQueue(current);
    }
  }
  return current;
}

import { supabase } from '../lib/supabaseClient';
import type {
  KaraokeRoom,
  QueueItem,
  RemoteCommand,
  CommandType,
  KaraokeGuest,
  SearchResultItem,
  SearchFilterType,
} from '../types';

export async function getRoomByCode(code: string): Promise<KaraokeRoom | null> {
  const { data, error } = await supabase
    .from('karaoke_rooms')
    .select('*')
    .ilike('room_code', code.trim())
    .single();

  if (error || !data) return null;
  return data as KaraokeRoom;
}

export async function getQueueForRoom(roomId: string): Promise<QueueItem[]> {
  const { data, error } = await supabase
    .from('karaoke_queue')
    .select('*')
    .eq('room_id', roomId)
    .in('status', ['queued', 'playing'])
    .order('priority_order', { ascending: true })
    .order('requested_at', { ascending: true });

  if (error || !data) return [];
  return data as QueueItem[];
}

export async function advanceNextSong(roomId: string): Promise<QueueItem | null> {
  const { data, error } = await supabase.rpc('fn_advance_next_song', {
    p_room_id: roomId,
  });

  if (error || !data) return null;
  return data as QueueItem;
}

export async function markCommandExecuted(commandId: string): Promise<void> {
  await supabase
    .from('karaoke_commands')
    .update({ is_executed: true })
    .eq('id', commandId);
}

export async function updatePlaybackTick(
  roomId: string,
  isPlaying: boolean,
  currentTimeSeconds: number
): Promise<void> {
  await supabase
    .from('karaoke_rooms')
    .update({
      is_playing: isPlaying,
      current_time_seconds: Math.floor(currentTimeSeconds),
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);
}

export async function sendRemoteCommand(
  roomId: string,
  command: CommandType,
  payload: Record<string, unknown> = {}
): Promise<RemoteCommand | null> {
  const { data, error } = await supabase
    .from('karaoke_commands')
    .insert([{ room_id: roomId, command, payload }])
    .select()
    .single();

  if (error || !data) return null;
  return data as RemoteCommand;
}

export async function reorderQueueItem(
  roomId: string,
  songId: string,
  newPosition: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc('fn_reorder_queue', {
    p_room_id: roomId,
    p_song_id: songId,
    p_new_position: newPosition,
  });

  return !error && data === true;
}

export async function purgeGuestSongs(roomId: string, guestId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('fn_purge_guest_songs', {
    p_room_id: roomId,
    p_guest_id: guestId,
  });

  return !error && typeof data === 'number';
}

export async function deleteQueueItem(songId: string): Promise<boolean> {
  const { error } = await supabase
    .from('karaoke_queue')
    .update({ status: 'cancelled_by_guest', finished_at: new Date().toISOString() })
    .eq('id', songId);

  return !error;
}

export async function resetRoomQueue(roomId: string): Promise<boolean> {
  const { error: queueErr } = await supabase
    .from('karaoke_queue')
    .update({ status: 'purged_by_host', finished_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .in('status', ['queued', 'playing']);

  const { error: roomErr } = await supabase
    .from('karaoke_rooms')
    .update({
      current_song_id: null,
      is_playing: false,
      current_time_seconds: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  return !queueErr && !roomErr;
}

export async function registerGuest(
  roomId: string,
  guestName: string,
  sessionToken: string
): Promise<KaraokeGuest | null> {
  const { data: existing } = await supabase
    .from('karaoke_guests')
    .select('*')
    .eq('room_id', roomId)
    .eq('session_token', sessionToken)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('karaoke_guests')
      .update({ guest_name: guestName.trim(), last_seen_at: new Date().toISOString(), is_active: true })
      .eq('id', existing.id);
    return existing as KaraokeGuest;
  }

  const { data, error } = await supabase
    .from('karaoke_guests')
    .insert([
      {
        room_id: roomId,
        guest_name: guestName.trim(),
        session_token: sessionToken,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error || !data) return null;
  return data as KaraokeGuest;
}

export async function addSongToQueue(params: {
  roomId: string;
  guestId?: string | null;
  videoId: string;
  title: string;
  author: string;
  thumbnailUrl?: string | null;
  durationSeconds: number;
  durationText: string;
  requestedBy: string;
}): Promise<QueueItem | null> {
  const { data: maxItem } = await supabase
    .from('karaoke_queue')
    .select('priority_order')
    .eq('room_id', params.roomId)
    .eq('status', 'queued')
    .order('priority_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPriority = (maxItem?.priority_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('karaoke_queue')
    .insert([
      {
        room_id: params.roomId,
        guest_id: params.guestId || null,
        video_id: params.videoId,
        title: params.title,
        author: params.author,
        thumbnail_url: params.thumbnailUrl || null,
        duration_seconds: params.durationSeconds,
        duration_text: params.durationText,
        requested_by: params.requestedBy,
        priority_order: nextPriority,
        status: 'queued',
      },
    ])
    .select()
    .single();

  if (error || !data) return null;
  return data as QueueItem;
}

export async function searchVideos(
  query: string,
  filter: SearchFilterType = 'all'
): Promise<SearchResultItem[]> {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&filter=${filter}`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results || []) as SearchResultItem[];
  } catch (err) {
    console.error('Error searching videos:', err);
    return [];
  }
}


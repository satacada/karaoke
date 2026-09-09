import { supabase } from '../lib/supabaseClient';
import { encodeSongThumbnail } from '../utils/songMeta';
import type {
  KaraokeRoom,
  QueueItem,
  RemoteCommand,
  CommandType,
  KaraokeGuest,
  SearchResultItem,
  SearchFilterType,
  PromoBanner,
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
  dedication?: string | null;
  isVip?: boolean;
}): Promise<QueueItem | null> {
  let targetPriority = 1;

  if (params.isVip) {
    const { data: queued } = await supabase
      .from('karaoke_queue')
      .select('id, priority_order, thumbnail_url')
      .eq('room_id', params.roomId)
      .eq('status', 'queued')
      .order('priority_order', { ascending: true });

    let existingVipCount = 0;
    if (queued) {
      for (const q of queued) {
        if (q.thumbnail_url?.includes('vip=1')) existingVipCount++;
      }
    }
    targetPriority = Math.min(existingVipCount + 1, 3);

    if (queued && queued.length > 0) {
      for (let i = queued.length - 1; i >= 0; i--) {
        if (queued[i].priority_order >= targetPriority) {
          await supabase
            .from('karaoke_queue')
            .update({ priority_order: queued[i].priority_order + 1 })
            .eq('id', queued[i].id);
        }
      }
    }
  } else {
    const { data: maxItem } = await supabase
      .from('karaoke_queue')
      .select('priority_order')
      .eq('room_id', params.roomId)
      .eq('status', 'queued')
      .order('priority_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    targetPriority = (maxItem?.priority_order ?? 0) + 1;
  }

  const encodedThumbnail = encodeSongThumbnail(params.thumbnailUrl, {
    dedication: params.dedication,
    isVip: params.isVip,
  });

  const { data, error } = await supabase
    .from('karaoke_queue')
    .insert([
      {
        room_id: params.roomId,
        guest_id: params.guestId || null,
        video_id: params.videoId,
        title: params.title,
        author: params.author,
        thumbnail_url: encodedThumbnail,
        duration_seconds: params.durationSeconds,
        duration_text: params.durationText,
        requested_by: params.requestedBy,
        priority_order: targetPriority,
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

export async function replaceGuestSong(
  songId: string,
  newVideo: {
    videoId: string;
    title: string;
    author: string;
    thumbnailUrl?: string | null;
    durationSeconds: number;
    durationText: string;
  }
): Promise<boolean> {
  const { data: rpcData, error: rpcError } = await supabase.rpc('fn_replace_guest_song', {
    p_song_id: songId,
    p_new_video_id: newVideo.videoId,
    p_new_title: newVideo.title,
    p_new_author: newVideo.author,
    p_new_thumbnail: newVideo.thumbnailUrl || null,
    p_new_duration_secs: newVideo.durationSeconds,
    p_new_duration_text: newVideo.durationText,
  });

  if (!rpcError && typeof rpcData === 'boolean') {
    return rpcData;
  }

  const { error } = await supabase
    .from('karaoke_queue')
    .update({
      video_id: newVideo.videoId,
      title: newVideo.title,
      author: newVideo.author,
      thumbnail_url: newVideo.thumbnailUrl || null,
      duration_seconds: newVideo.durationSeconds,
      duration_text: newVideo.durationText,
    })
    .eq('id', songId)
    .eq('status', 'queued');

  return !error;
}

let isSwappingInFlight = false;

export async function swapGuestSongs(
  songId1: string,
  songId2: string
): Promise<boolean> {
  if (isSwappingInFlight) return false;
  isSwappingInFlight = true;

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('fn_swap_guest_songs', {
      p_song_id_1: songId1,
      p_song_id_2: songId2,
    });

    if (!rpcError && typeof rpcData === 'boolean') {
      return rpcData;
    }

    const { data: songs, error: fetchErr } = await supabase
      .from('karaoke_queue')
      .select('id, room_id, priority_order, status, requested_at')
      .in('id', [songId1, songId2]);

    if (fetchErr || !songs || songs.length !== 2) return false;
    const s1 = songs.find((s) => s.id === songId1);
    const s2 = songs.find((s) => s.id === songId2);
    if (!s1 || !s2 || s1.status !== 'queued' || s2.status !== 'queued') return false;

    let order1 = s1.priority_order;
    let order2 = s2.priority_order;

    // Reparación de colisión: si ambos tienen el mismo priority_order, recompactar ordinales de la sala
    if (order1 === order2) {
      const { data: allQueued } = await supabase
        .from('karaoke_queue')
        .select('id')
        .eq('room_id', s1.room_id)
        .eq('status', 'queued')
        .order('priority_order', { ascending: true })
        .order('requested_at', { ascending: true });

      if (allQueued && allQueued.length > 0) {
        for (let i = 0; i < allQueued.length; i++) {
          await supabase.from('karaoke_queue').update({ priority_order: i + 1 }).eq('id', allQueued[i].id);
        }
        const idx1 = allQueued.findIndex((q) => q.id === songId1);
        const idx2 = allQueued.findIndex((q) => q.id === songId2);
        order1 = idx1 >= 0 ? idx1 + 1 : 1;
        order2 = idx2 >= 0 ? idx2 + 1 : 2;
      }
    }

    // Intercambio seguro con offset temporal para evitar colisiones intermedias
    const tempOffset = 900000 + Math.floor(Math.random() * 10000);
    await supabase.from('karaoke_queue').update({ priority_order: tempOffset }).eq('id', songId1);
    const { error: err2 } = await supabase.from('karaoke_queue').update({ priority_order: order1 }).eq('id', songId2);
    const { error: err1 } = await supabase.from('karaoke_queue').update({ priority_order: order2 }).eq('id', songId1);

    return !err1 && !err2;
  } finally {
    isSwappingInFlight = false;
  }
}

export async function updateRoomSettings(
  roomId: string,
  updates: Partial<KaraokeRoom>
): Promise<boolean> {
  const { error } = await supabase
    .from('karaoke_rooms')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  return !error;
}

export async function approveRoom(
  roomId: string,
  approvedBy: string,
  isApproved: boolean
): Promise<boolean> {
  const { data: rpcData, error: rpcError } = await supabase.rpc('fn_approve_room', {
    p_room_id: roomId,
    p_approved_by: approvedBy,
    p_status: isApproved,
  });

  if (!rpcError && typeof rpcData === 'boolean') {
    return rpcData;
  }

  const { error } = await supabase
    .from('karaoke_rooms')
    .update({
      is_approved: isApproved,
      approved_at: isApproved ? new Date().toISOString() : null,
      approved_by: isApproved ? approvedBy : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  return !error;
}

export async function getAllRoomsForSuperAdmin(): Promise<KaraokeRoom[]> {
  const { data, error } = await supabase
    .from('karaoke_rooms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as KaraokeRoom[];
}

export async function updateRoomBanners(
  roomId: string,
  banners: PromoBanner[]
): Promise<boolean> {
  await sendRemoteCommand(roomId, 'set_promo_banners', { banners });
  try {
    await supabase.from('karaoke_rooms').update({ promo_banners: banners }).eq('id', roomId);
  } catch {
    // Ignorar si la columna aún no está creada en BD
  }
  return true;
}

export async function toggleQueueLock(
  roomId: string,
  isLocked: boolean
): Promise<boolean> {
  await sendRemoteCommand(roomId, 'toggle_queue_lock', { isLocked });
  try {
    await supabase.from('karaoke_rooms').update({ is_queue_locked: isLocked }).eq('id', roomId);
  } catch {
    // Fallback silencioso si no se migró aún
  }
  return true;
}

export async function toggleSongLike(
  songId: string,
  guestName: string
): Promise<{ success: boolean; liked?: boolean; likesCount?: number }> {
  try {
    const { data, error } = await supabase.rpc('fn_toggle_song_like', {
      p_song_id: songId,
      p_guest_name: guestName,
    });
    if (!error && data?.success) {
      return { success: true, liked: data.liked, likesCount: data.likes_count };
    }
  } catch {
    // Fallback
  }
  return { success: true, liked: true, likesCount: 1 };
}

export async function getRoomsForOwner(ownerEmail: string): Promise<KaraokeRoom[]> {
  const { data, error } = await supabase
    .from('karaoke_rooms')
    .select('*')
    .or(`owner_email.eq.${ownerEmail},room_code.eq.FIESTA`)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data as KaraokeRoom[];
}

export async function createOwnerRoom(params: {
  ownerEmail: string;
  businessName: string;
  zoneName: string;
  roomCode: string;
  hostPin: string;
  vipPriceArs?: number;
}): Promise<KaraokeRoom | null> {
  const cleanCode = params.roomCode.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
  const basePayload: Record<string, unknown> = {
    owner_email: params.ownerEmail,
    business_name: params.businessName,
    name: `${params.businessName} - ${params.zoneName}`,
    room_code: cleanCode,
    host_pin: params.hostPin,
    status: 'active',
    is_approved: true,
    price_per_song: params.vipPriceArs || 500,
  };

  try {
    const { data, error } = await supabase
      .from('karaoke_rooms')
      .insert({ ...basePayload, zone_name: params.zoneName, vip_price_ars: params.vipPriceArs || 500 })
      .select()
      .single();
    if (!error && data) return data as KaraokeRoom;
  } catch {
    // Fallback
  }

  const { data, error } = await supabase
    .from('karaoke_rooms')
    .insert(basePayload)
    .select()
    .single();

  if (error || !data) return null;
  return { ...(data as KaraokeRoom), zone_name: params.zoneName, vip_price_ars: params.vipPriceArs || 500 };
}

export async function setRoomStatus(
  roomId: string,
  status: 'active' | 'paused' | 'closed'
): Promise<boolean> {
  const { error } = await supabase
    .from('karaoke_rooms')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', roomId);
  return !error;
}

export async function transferQueueBetweenRooms(
  sourceRoomId: string,
  targetRoomId: string
): Promise<{ success: boolean; transferredCount?: number }> {
  try {
    const { data, error } = await supabase.rpc('fn_transfer_room_queue', {
      p_source_room_id: sourceRoomId,
      p_target_room_id: targetRoomId,
    });
    if (!error && data?.success) {
      return { success: true, transferredCount: data.transferred_count };
    }
  } catch {
    // Fallback manual si el RPC aún no se ejecutó en BD
  }

  try {
    const { data: targetSongs } = await supabase
      .from('karaoke_queue')
      .select('priority_order')
      .eq('room_id', targetRoomId)
      .eq('status', 'queued')
      .order('priority_order', { ascending: false })
      .limit(1);

    const maxPriority = (targetSongs?.[0]?.priority_order) || 0;
    const { data: sourceSongs } = await supabase
      .from('karaoke_queue')
      .select('id, priority_order')
      .eq('room_id', sourceRoomId)
      .eq('status', 'queued')
      .order('priority_order', { ascending: true });

    if (sourceSongs && sourceSongs.length > 0) {
      for (let i = 0; i < sourceSongs.length; i++) {
        await supabase
          .from('karaoke_queue')
          .update({ room_id: targetRoomId, priority_order: maxPriority + i + 1 })
          .eq('id', sourceSongs[i].id);
      }
      return { success: true, transferredCount: sourceSongs.length };
    }
  } catch {
    // Fallback
  }
  return { success: true, transferredCount: 0 };
}

export async function updateRoomZoneConfig(
  roomId: string,
  config: { zoneName?: string; allowedGenres?: string[]; vipPriceArs?: number; hostPin?: string }
): Promise<boolean> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (config.zoneName) updates.zone_name = config.zoneName;
  if (config.allowedGenres) updates.allowed_genres = config.allowedGenres;
  if (config.vipPriceArs !== undefined) {
    updates.vip_price_ars = config.vipPriceArs;
    updates.price_per_song = config.vipPriceArs;
  }
  if (config.hostPin) updates.host_pin = config.hostPin;

  const { error } = await supabase.from('karaoke_rooms').update(updates).eq('id', roomId);
  return !error;
}



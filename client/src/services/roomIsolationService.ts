// ==============================================================================
// SERVICIO: AISLAMIENTO MULTI-CUENTA Y MULTI-TV (ROOM ISOLATION SERVICE)
// Archivo: client/src/services/roomIsolationService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import { createOwnerRoom, getRoomByCode } from './karaokeApi';
import type { KaraokeRoom } from '../types';

const OWN_ROOM_STORAGE_KEY = 'admin_own_room_code';

export function getOrCreateDeviceAdminRoomCode(): string {
  try {
    const saved = localStorage.getItem(OWN_ROOM_STORAGE_KEY);
    if (saved && saved !== 'FIESTA') return saved;
    const paired = localStorage.getItem('tv_paired_room');
    if (paired && paired !== 'FIESTA') {
      localStorage.setItem(OWN_ROOM_STORAGE_KEY, paired);
      return paired;
    }
    const newCode = `SALA-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(OWN_ROOM_STORAGE_KEY, newCode);
    return newCode;
  } catch {
    return `SALA-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}

export async function ensureRoomExists(
  roomCode: string,
  ownerEmail?: string | null,
  roomName?: string
): Promise<KaraokeRoom | null> {
  const cleanCode = roomCode.trim().toUpperCase();
  const existing = await getRoomByCode(cleanCode);
  if (existing) return existing;

  return createOwnerRoom({
    ownerEmail: ownerEmail || `tv_${cleanCode.toLowerCase()}@karaoke.local`,
    businessName: roomName || `Karaoke ${cleanCode}`,
    zoneName: 'Salón Principal',
    roomCode: cleanCode,
    hostPin: '1234',
    vipPriceArs: 100,
  });
}

export async function ensureAccountIsolatedRoom(
  email: string,
  displayName?: string
): Promise<KaraokeRoom | null> {
  const cleanEmail = email.trim().toLowerCase();
  const { data: ownedRooms } = await supabase
    .from('karaoke_rooms')
    .select('*')
    .ilike('owner_email', cleanEmail)
    .order('created_at', { ascending: true });

  if (ownedRooms && ownedRooms.length > 0) {
    const primary = ownedRooms[0] as KaraokeRoom;
    try {
      localStorage.setItem(OWN_ROOM_STORAGE_KEY, primary.room_code);
      localStorage.setItem('tv_paired_room', primary.room_code);
    } catch {}
    return primary;
  }

  const prefix = (displayName || cleanEmail.split('@')[0] || 'SALA')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4) || 'SALA';
  const newRoomCode = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

  const created = await createOwnerRoom({
    ownerEmail: cleanEmail,
    businessName: displayName ? `Karaoke de ${displayName}` : `Karaoke ${newRoomCode}`,
    zoneName: 'Salón Principal',
    roomCode: newRoomCode,
    hostPin: '1234',
    vipPriceArs: 100,
  });

  if (created) {
    try {
      localStorage.setItem(OWN_ROOM_STORAGE_KEY, created.room_code);
      localStorage.setItem('tv_paired_room', created.room_code);
    } catch {}
  }
  return created;
}

export async function resolveIsolatedTvLinkRoom(
  inputCode: string,
  fallbackAdminRoom?: string | null
): Promise<{ roomCode: string; roomName: string }> {
  const clean = inputCode.trim().toUpperCase();
  let targetCode = clean;

  if (clean.startsWith('TV-')) {
    const digits = clean.replace('TV-', '');
    const savedOwn = localStorage.getItem(OWN_ROOM_STORAGE_KEY);
    targetCode =
      savedOwn && savedOwn !== 'FIESTA'
        ? savedOwn
        : fallbackAdminRoom && fallbackAdminRoom !== 'FIESTA'
        ? fallbackAdminRoom
        : `SALA-${digits}`;
  }

  const room = await ensureRoomExists(targetCode);
  try {
    localStorage.setItem(OWN_ROOM_STORAGE_KEY, targetCode);
    localStorage.setItem('tv_paired_room', targetCode);
  } catch {}

  return { roomCode: targetCode, roomName: room?.zone_name || room?.name || `Sala ${targetCode}` };
}

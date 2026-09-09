// ==============================================================================
// UTILIDAD: IDENTIFICADOR ÚNICO DE DISPOSITIVO (DEVICE ID) Y CONTROL DE VIP
// Archivo: client/src/utils/deviceId.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { QueueItem } from '../types';
import { parseSongMeta } from './songMeta';

const DEVICE_STORAGE_KEY = 'rockola_device_id';
export const MAX_CONSECUTIVE_VIP_PER_DEVICE = 3;
export const VIP_PRICE_ARS = 500;
export const MERCADO_PAGO_ALIAS = 'david.taboa';

/**
 * Obtiene o genera un identificador único persistente para este dispositivo.
 * Dado que los navegadores web bloquean el acceso al IMEI/MAC por privacidad,
 * esta huella UUID local identifica unívocamente al teléfono del usuario.
 */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(DEVICE_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'dev_session_fallback';
  }
}

/**
 * Calcula cuántas canciones VIP activas (en cola o reproduciéndose)
 * tiene actualmente este dispositivo o usuario.
 */
export function countActiveVipSongs(queue: QueueItem[], guestName: string): number {
  const normName = (guestName || '').trim().toLowerCase();
  const activeSongs = queue.filter(
    (q) => q.status === 'queued' && (q.requested_by || '').trim().toLowerCase() === normName
  );

  return activeSongs.filter((song) => {
    const meta = parseSongMeta(song);
    return meta.isVip;
  }).length;
}

/**
 * Valida si el dispositivo tiene permitido solicitar otro Pase VIP.
 * Máximo permitido: 3 temas VIP consecutivos sin reproducir ($1.500 ARS total).
 */
export function canRequestVip(queue: QueueItem[], guestName: string): {
  allowed: boolean;
  currentCount: number;
  remainingCount: number;
  reason?: string;
} {
  const currentCount = countActiveVipSongs(queue, guestName);
  const remainingCount = Math.max(0, MAX_CONSECUTIVE_VIP_PER_DEVICE - currentCount);

  if (currentCount >= MAX_CONSECUTIVE_VIP_PER_DEVICE) {
    return {
      allowed: false,
      currentCount,
      remainingCount: 0,
      reason: `Límite alcanzado: Ya tienes ${MAX_CONSECUTIVE_VIP_PER_DEVICE} pases VIP activos en la fila. Espera a que suenen para pedir otro.`,
    };
  }

  return {
    allowed: true,
    currentCount,
    remainingCount,
  };
}

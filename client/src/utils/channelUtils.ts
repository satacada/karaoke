// ==============================================================================
// CONSTANTES DE CANALES REALTIME COMPARTIDOS
// Archivo: client/src/utils/channelUtils.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

/**
 * Retorna el nombre único de canal de broadcast para una sala dada.
 * Garantiza que tanto la TV como el Host y los Invitados escuchen y emitan
 * exactamente en el mismo canal de Supabase Realtime.
 */
export function getRoomChannelName(roomId: string): string {
  if (!roomId) return 'room-channel-default';
  return `room-channel-${roomId.trim()}`;
}

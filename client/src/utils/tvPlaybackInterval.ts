// ==============================================================================
// UTILIDAD: INTERVALO NO INVASIVO PARA OVERLAYS DE TV (HUD Y NEXT TICKER)
// Archivo: client/src/utils/tvPlaybackInterval.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

/**
 * Calcula si los elementos informativos (Siguiente canción arriba y Título actual abajo)
 * deben ser visibles de manera no invasiva:
 * 1. Siempre visible si el reproductor está pausado.
 * 2. Primeros 15 segundos al iniciar la canción (presentación inicial).
 * 3. Últimos 20 segundos antes de finalizar (preparación del siguiente cantante).
 * 4. Intervalo periódico en el medio: visible 10 segundos cada 45 segundos
 *    (ej. a los 45s, 90s, 135s...) para mantener informada a la sala
 *    sin invadir ni tapar los subtítulos o letras del karaoke en pantalla.
 */
export function isTvHudIntervalActive(
  currentTime: number,
  duration: number,
  isPaused: boolean = false
): boolean {
  if (isPaused) return true;
  const effectiveDuration = duration > 0 ? duration : 180;
  if (currentTime <= 15) return true;
  if (effectiveDuration > 30 && currentTime >= effectiveDuration - 20) return true;
  const cycleTime = Math.floor(currentTime) % 45;
  return cycleTime < 10;
}

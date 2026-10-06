// ==============================================================================
// UTILIDAD: PURGA DE ESTADO Y RESET LIMPIO (COLD START)
// Archivo: client/src/utils/cleanStart.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

/**
 * Detecta parámetros ?reset=1, ?clean=1 o ?cold=1 en la URL.
 * Si están presentes, borra por completo localStorage y sessionStorage
 * y limpia el parámetro de la URL sin recargar para dejar un entorno virgen
 * idéntico al primer arranque de un TV Box recién instalado.
 */
export function executeCleanStartIfRequested(): void {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const hasReset =
      params.has('reset') ||
      params.has('clean') ||
      params.has('cold');

    if (hasReset) {
      // Purgar vestigios de almacenamiento local y sesión
      localStorage.clear();
      sessionStorage.clear();

      // Eliminar el parámetro reset/clean/cold de la barra de direcciones limpiamente
      params.delete('reset');
      params.delete('clean');
      params.delete('cold');

      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
      console.info('🧹 [ColdStart] Almacenamiento local purgado por completo. Estado inicial limpio establecido.');
    }
  } catch (error) {
    console.warn('⚠️ [ColdStart] No se pudo purgar el almacenamiento:', error);
  }
}

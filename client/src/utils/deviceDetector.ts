// ==============================================================================
// UTILIDAD: DETECTOR DE DISPOSITIVO (TV vs CELULAR MÓVIL)
// Archivo: client/src/utils/deviceDetector.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

export function isTvDevice(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Preferencia guardada o anulación manual
    const savedHide = localStorage.getItem('rockola_hide_mode_nav');
    if (savedHide === 'true') return true;
    const force = localStorage.getItem('rockola_force_device')?.toLowerCase();
    if (force === 'tv') return true;
    if (force === 'mobile') return false;

    // 2. Parámetros de URL
    const params = new URLSearchParams(window.location.search);
    const deviceParam = params.get('device')?.toLowerCase();
    if (deviceParam === 'tv') return true;
    if (deviceParam === 'mobile') return false;
    if (params.get('mode')?.toLowerCase() === 'tv') return true;

    // 3. User-Agent
    const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
    const tvPatterns = [
      'googletv', 'androidtv', 'smart-tv', 'smarttv', 'appletv', 'hbbtv',
      'netcast', 'viera', 'bravia', 'roku', 'firetv', 'aftb', 'aftm', 'afts',
      'boxee', 'kylo', 'webos', 'tizen', 'leanback', 'large screen', 'crkey',
      'mibox', 'mitv', 'shield android tv', 'tv box', 'atv',
    ];
    if (tvPatterns.some((pattern) => ua.includes(pattern))) return true;

    // 4. Regla oficial Android: "Android" sin "Mobile"
    const isAndroid = ua.includes('android');
    const isMobile = ua.includes('mobile');
    if (isAndroid && !isMobile) return true;

    // 5. Capacitor o Navegador en Pantalla Panorámica de TV (Landscape 16:9 sin multitouch)
    const isLandscape = window.innerWidth > window.innerHeight;
    const aspectRatio = window.innerWidth / Math.max(1, window.innerHeight);
    const hasMultiTouch = 'ontouchstart' in window && (navigator.maxTouchPoints || 0) > 1;

    // Si es pantalla amplia apaisada (formato TV 16:9, >= 850px) y no tiene multitáctil de celular
    if (isLandscape && aspectRatio >= 1.5 && window.innerWidth >= 850 && !hasMultiTouch) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

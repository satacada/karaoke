// ==============================================================================
// UTILIDAD: RESOLUCIÓN DE URL PÚBLICA PARA QR Y ENLACES (APP URL)
// Archivo: client/src/utils/appUrl.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

export const PROD_APP_URL = 'https://karaoke-tc-c9fb.vercel.app';

/**
 * Retorna la URL pública oficial para códigos QR.
 * Si la aplicación corre en APK local (Capacitor/localhost),
 * garantiza que el QR apunte a la nube de Vercel y no a la red local privada.
 */
export function getPublicBaseUrl(): string {
  if (typeof window === 'undefined') return PROD_APP_URL;

  try {
    const origin = window.location.origin || '';
    const isLocal =
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('capacitor://') ||
      origin.startsWith('file:') ||
      origin.includes('192.168.') ||
      origin.includes('10.0.');

    if (isLocal) {
      return import.meta.env.VITE_APP_URL && !import.meta.env.VITE_APP_URL.includes('localhost')
        ? import.meta.env.VITE_APP_URL
        : PROD_APP_URL;
    }

    return origin;
  } catch {
    return PROD_APP_URL;
  }
}

export function getJoinUrl(roomCode: string): string {
  return `${getPublicBaseUrl()}/join?room=${encodeURIComponent(roomCode)}`;
}

export function getPairUrl(pairCode: string): string {
  return `${getPublicBaseUrl()}/host?pair=${encodeURIComponent(pairCode)}`;
}

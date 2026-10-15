// ==============================================================================
// SERVICIO DE ACTUALIZACIÓN AUTOMÁTICA DESATENDIDA (ZERO CONSULTAS AL USUARIO)
// Archivo: client/src/services/autoUpdateService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import { APP_VERSION } from '../version';

let isChecking = false;
let checkTimer: number | undefined;

export async function checkForAppUpdates(): Promise<boolean> {
  if (isChecking) return false;
  isChecking = true;
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    if (!res.ok) return false;
    const data = await res.json();
    const remoteVersion = data.version;

    if (remoteVersion && remoteVersion !== APP_VERSION) {
      const lastReload = sessionStorage.getItem('karaoke_last_auto_reload');
      if (lastReload === remoteVersion) return false;
      sessionStorage.setItem('karaoke_last_auto_reload', remoteVersion);

      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.update().catch(() => {});
          reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
        }
      }

      window.location.reload();
      return true;
    }
  } catch {
    // Red no disponible o fallo temporal en background
  } finally {
    isChecking = false;
  }
  return false;
}

export function initAutoUpdate(): () => void {
  // 1. Verificación inicial inmediata
  checkForAppUpdates();

  // 2. Verificación periódica cada 60s
  checkTimer = window.setInterval(checkForAppUpdates, 60000);

  // 3. Verificación cuando el usuario vuelve a enfocar o abrir la aplicación
  const onFocusOrVisible = () => {
    if (document.visibilityState === 'visible') checkForAppUpdates();
  };
  document.addEventListener('visibilitychange', onFocusOrVisible);
  window.addEventListener('focus', onFocusOrVisible);

  // 4. Registro de Service Worker para PWA y escucha de nuevo controlador
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
    }).catch(() => {});

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  return () => {
    if (checkTimer) clearInterval(checkTimer);
    document.removeEventListener('visibilitychange', onFocusOrVisible);
    window.removeEventListener('focus', onFocusOrVisible);
  };
}

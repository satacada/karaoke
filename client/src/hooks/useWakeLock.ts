import { useState, useEffect, useCallback } from 'react';

export function useWakeLock(shouldAcquire = true) {
  const [isLocked, setIsLocked] = useState(false);

  const requestLock = useCallback(async () => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      setIsLocked(true);
      sentinel.addEventListener('release', () => setIsLocked(false));
    } catch {
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    if (!shouldAcquire) return;
    requestLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && shouldAcquire) requestLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [shouldAcquire, requestLock]);

  return { isLocked, requestLock };
}

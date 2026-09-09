import { useState, useEffect, useCallback } from 'react';
import type { GuestSession, GuestPresenceStatus } from '../types';

const GRACE_PERIOD_MS = 60 * 60 * 1000; // 60 minutos de gracia
const MAX_DISTANCE_METERS = 200; // Radio permitido de 200 metros
const STORAGE_KEY = 'karaoke_guest_session_v1';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGuestPresence() {
  const [session, setSession] = useState<GuestSession | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as GuestSession;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState<GuestPresenceStatus>({
    isWithinGracePeriod: true,
    remainingGraceMinutes: 60,
    hasLocationPermission: false,
  });

  useEffect(() => {
    if (!session) return;
    const checkGrace = () => {
      const elapsed = Date.now() - session.joinedAt;
      const remainingMs = Math.max(0, GRACE_PERIOD_MS - elapsed);
      const isWithin = remainingMs > 0;
      setStatus((prev) => ({
        ...prev,
        isWithinGracePeriod: isWithin,
        remainingGraceMinutes: Math.ceil(remainingMs / 60000),
      }));
    };
    checkGrace();
    const interval = setInterval(checkGrace, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const saveSession = useCallback(
    (name: string, guestId?: string, coords?: { lat: number; lng: number }) => {
      const newSession: GuestSession = {
        guestName: name.trim(),
        sessionToken: session?.sessionToken || crypto.randomUUID(),
        guestId,
        joinedAt: Date.now(),
        initialLat: coords?.lat,
        initialLng: coords?.lng,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
    },
    [session]
  );

  const verifyPresence = useCallback(async (): Promise<{
    allowed: boolean;
    reason?: 'distance' | 'permission' | 'no_session';
    distanceMeters?: number;
  }> => {
    if (!session) return { allowed: false, reason: 'no_session' };
    const elapsed = Date.now() - session.joinedAt;
    if (elapsed < GRACE_PERIOD_MS) return { allowed: true };
    if (!session.initialLat || !session.initialLng || !('geolocation' in navigator)) {
      return { allowed: true };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = haversineDistance(
            session.initialLat!,
            session.initialLng!,
            pos.coords.latitude,
            pos.coords.longitude
          );
          if (dist <= MAX_DISTANCE_METERS) {
            resolve({ allowed: true, distanceMeters: Math.round(dist) });
          } else {
            resolve({ allowed: false, reason: 'distance', distanceMeters: Math.round(dist) });
          }
        },
        () => resolve({ allowed: true }), // Fallback suave si el navegador no entrega señal GPS
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }, [session]);

  return { session, status, saveSession, verifyPresence };
}

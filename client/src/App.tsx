import { useState, useEffect, useMemo, type FC } from 'react';
import { TvView } from './components/tv/TvView';
import { TvActivationScreen } from './components/tv/TvActivationScreen';
import { HostView } from './components/host/HostView';
import { GuestView } from './components/guest/GuestView';
import { isTvDevice } from './utils/deviceDetector';
import { Sliders, Music, QrCode } from 'lucide-react';

export const App: FC = () => {
  const isTv = useMemo(() => isTvDevice(), []);
  const [currentMode, setCurrentMode] = useState<'tv' | 'host' | 'guest'>(() => (isTv ? 'tv' : 'host'));
  const [roomCode, setRoomCode] = useState<string | null>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get('room')?.toUpperCase() || localStorage.getItem('tv_paired_room') || null;
    } catch { return null; }
  });

  const isGuestOnly = useMemo(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const isGuestRoute = window.location.pathname.startsWith('/join') || p.get('mode') === 'guest';
      const hasAuth = sessionStorage.getItem(`host_auth_${roomCode || 'FIESTA'}`) === 'true';
      const isNative = Boolean((window as unknown as { Capacitor?: unknown }).Capacitor);
      return isGuestRoute && !hasAuth && !isNative;
    } catch { return false; }
  }, [roomCode]);

  useEffect(() => {
    if (isTv) { setCurrentMode('tv'); return; }
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const queryRoom = params.get('room');
    if (queryRoom) {
      const r = queryRoom.toUpperCase(); setRoomCode(r);
      try { localStorage.setItem('tv_paired_room', r); } catch {}
    }
    const queryMode = params.get('mode');
    if (queryMode === 'host' || path.startsWith('/host')) setCurrentMode('host');
    else if (queryMode === 'guest' || path.startsWith('/join') || path.startsWith('/guest')) setCurrentMode('guest');
    else {
      const saved = sessionStorage.getItem('rockola_app_mode') as 'tv' | 'host' | 'guest' | null;
      if (saved) setCurrentMode(saved);
      else setCurrentMode('host');
    }
  }, [isTv]);

  const handleSelectMode = (mode: 'tv' | 'host' | 'guest') => {
    setCurrentMode(mode);
    try { sessionStorage.setItem('rockola_app_mode', mode); } catch {}
  };

  const handleTvPaired = (newCode: string) => {
    setRoomCode(newCode);
    try { localStorage.setItem('tv_paired_room', newCode); } catch {}
  };

  const handleTvUnlink = () => {
    setRoomCode(null);
    try { localStorage.removeItem('tv_paired_room'); } catch {}
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col w-full overflow-x-hidden">
      {!isTv && !isGuestOnly && (
        <nav aria-label="Selector de rol" className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 rounded-full p-1 shadow-2xl">
          <button type="button" onClick={() => handleSelectMode('host')} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${currentMode === 'host' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
            <Sliders className="w-3.5 h-3.5" /><span>Administrador</span>
          </button>
          <button type="button" onClick={() => handleSelectMode('guest')} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${currentMode === 'guest' ? 'bg-gradient-to-r from-pink-600 to-amber-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
            <Music className="w-3.5 h-3.5" /><span>Cliente</span>
          </button>
          <button type="button" onClick={() => handleSelectMode('tv')} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${currentMode === 'tv' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
            <QrCode className="w-3.5 h-3.5" /><span>Código QR</span>
          </button>
        </nav>
      )}

      {roomCode ? (
        <div className={currentMode === 'tv' ? 'block' : 'hidden'}>
          <TvView roomCode={roomCode} onUnlink={handleTvUnlink} />
        </div>
      ) : currentMode === 'tv' ? (
        <TvActivationScreen onPaired={handleTvPaired} />
      ) : null}

      {currentMode === 'host' && (
        <HostView roomCode={roomCode || 'FIESTA'} onSwitchToTv={() => handleSelectMode('tv')} onSwitchToGuest={() => handleSelectMode('guest')} />
      )}

      {currentMode === 'guest' && (
        <GuestView roomCode={roomCode || 'FIESTA'} onSwitchToHost={!isGuestOnly ? () => handleSelectMode('host') : undefined} />
      )}
    </div>
  );
};

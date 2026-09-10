import { useState, useEffect, useMemo, type FC } from 'react';
import { TvView } from './components/tv/TvView';
import { TvActivationScreen } from './components/tv/TvActivationScreen';
import { HostView } from './components/host/HostView';
import { GuestView } from './components/guest/GuestView';
import { isTvDevice } from './utils/deviceDetector';
import { Tv, Sliders } from 'lucide-react';

export const App: FC = () => {
  const isTv = useMemo(() => isTvDevice(), []);
  const [hideModeNav, setHideModeNav] = useState(() => isTv || localStorage.getItem('rockola_hide_mode_nav') === 'true');
  const [currentMode, setCurrentMode] = useState<'tv' | 'host' | 'guest'>(() => (isTv ? 'tv' : 'tv'));
  const [roomCode, setRoomCode] = useState<string | null>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get('room')?.toUpperCase() || localStorage.getItem('tv_paired_room') || null;
    } catch { return null; }
  });

  useEffect(() => {
    if (isTv) {
      setCurrentMode('tv');
      return;
    }
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
      const saved = sessionStorage.getItem('rockola_app_mode') as 'tv' | 'host' | null;
      if (saved === 'host') setCurrentMode('host');
      else setCurrentMode('tv');
    }
  }, [isTv]);

  const handleSelectMode = (mode: 'tv' | 'host') => {
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
      {currentMode !== 'guest' && !hideModeNav && (
        <nav aria-label="Selector de modo" className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-full p-1 shadow-2xl">
          <button
            type="button"
            onClick={() => handleSelectMode('tv')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              currentMode === 'tv'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Modo Android (QR)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('host')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              currentMode === 'host'
                ? 'bg-gradient-to-r from-pink-600 to-amber-600 text-white shadow-lg shadow-pink-950/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Host DJ</span>
          </button>
          <button
            type="button"
            onClick={() => { setHideModeNav(true); try { localStorage.setItem('rockola_hide_mode_nav', 'true'); } catch {} }}
            title="Ocultar barra de modo (Modo TV limpio)"
            className="w-5 h-5 flex items-center justify-center rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all text-xs ml-0.5"
          >
            ✕
          </button>
        </nav>
      )}

      {currentMode === 'tv' && (
        roomCode ? <TvView roomCode={roomCode} onUnlink={handleTvUnlink} /> : <TvActivationScreen onPaired={handleTvPaired} />
      )}

      {currentMode === 'host' && <HostView roomCode={roomCode || 'FIESTA'} onSwitchToTv={() => handleSelectMode('tv')} />}

      {currentMode === 'guest' && <GuestView roomCode={roomCode || 'FIESTA'} onSwitchToHost={() => handleSelectMode('host')} />}
    </div>
  );
};

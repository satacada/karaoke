import { useState, useEffect, type FC } from 'react';
import { TvView } from './components/tv/TvView';
import { HostView } from './components/host/HostView';
import { GuestView } from './components/guest/GuestView';
import { Tv, Sliders, Smartphone } from 'lucide-react';

export const App: FC = () => {
  const [currentMode, setCurrentMode] = useState<'tv' | 'host' | 'guest'>('tv');
  const [roomCode, setRoomCode] = useState<string>('FIESTA');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    const queryRoom = params.get('room');
    if (queryRoom) setRoomCode(queryRoom.toUpperCase());

    const queryMode = params.get('mode');
    if (queryMode === 'host' || path.startsWith('/host')) {
      setCurrentMode('host');
    } else if (queryMode === 'guest' || path.startsWith('/join') || path.startsWith('/guest')) {
      setCurrentMode('guest');
    } else {
      setCurrentMode('tv');
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col w-full overflow-x-hidden">
      {/* Dev Mode Switcher Bar (solo visible en desarrollo local) */}
      {import.meta.env.DEV && currentMode !== 'guest' && (
        <nav
          aria-label="Barra de selección de rol"
          className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-full px-3 py-1 shadow-lg opacity-40 hover:opacity-100 transition-opacity"
        >
        <button
          onClick={() => setCurrentMode('tv')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            currentMode === 'tv'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Modo TV</span>
        </button>

        <button
          onClick={() => setCurrentMode('host')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            currentMode === 'host'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Host DJ</span>
        </button>

        <button
          onClick={() => setCurrentMode('guest')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-zinc-400 hover:text-white transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Invitado</span>
        </button>
      </nav>
      )}

      {/* View router */}
      {currentMode === 'tv' && <TvView roomCode={roomCode} />}

      {currentMode === 'host' && <HostView roomCode={roomCode} />}

      {currentMode === 'guest' && <GuestView roomCode={roomCode} />}
    </div>
  );
};

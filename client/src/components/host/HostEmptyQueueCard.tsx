import { useState, type FC } from 'react';
import { Music, Radio, Sparkles, AlertCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { parseAutoDjGenre, AUTO_DJ_STATIONS } from '../../services/autoDjService';
import { isLocalAutoDjActive, getLocalAutoDjGenre } from '../../services/autoDjStateService';
import type { KaraokeRoom } from '../../types';

interface HostEmptyQueueCardProps {
  room: KaraokeRoom | null;
  onOpenAutoDj: () => void;
  onOpenSearch?: () => void;
  onStartAutoDj?: () => void;
  onStartGenre?: (genre: string) => void;
  isStartingAutoDj?: boolean;
}

export const HostEmptyQueueCard: FC<HostEmptyQueueCardProps> = ({
  room, onOpenAutoDj, onOpenSearch, onStartAutoDj, onStartGenre, isStartingAutoDj = false,
}) => {
  const [showGenres, setShowGenres] = useState(true);
  const isAutoDj = Boolean(room?.auto_dj_enabled) || isLocalAutoDjActive(room?.room_code || 'FIESTA');
  const activeGenre = room?.auto_dj_genre || getLocalAutoDjGenre(room?.room_code || 'FIESTA') || 'cumbia_fiesta';
  const genreInfo = parseAutoDjGenre(activeGenre);

  return (
    <div className="p-4 text-center text-xs bg-zinc-900/60 rounded-3xl border border-zinc-800 flex flex-col items-center gap-3 shadow-xl">
      <div className="w-full flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center justify-center">
            <Music className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Cola sin temas pendientes
            </h4>
            <p className="text-[10px] text-zinc-400">Elige qué tema sigue o activa una estación</p>
          </div>
        </div>

        {/* Botón para cerrar o desplegar los géneros */}
        <button
          type="button"
          onClick={() => setShowGenres(!showGenres)}
          className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold border border-zinc-700/80 flex items-center gap-1 cursor-pointer"
        >
          <span>{showGenres ? 'Ocultar Estaciones' : 'Ver Estaciones'}</span>
          {showGenres ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Botón destacado para Buscar Canción Directa como Administrador */}
      {onOpenSearch && (
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>🔍 Buscar Canción en YouTube para la TV</span>
        </button>
      )}

      {showGenres && (
        <>
          {/* Selector rápido de estaciones directas con etiquetas globales claras */}
          <div className="grid grid-cols-2 gap-1.5 w-full">
            {AUTO_DJ_STATIONS.slice(0, 4).map((st) => (
              <button
                key={st.id}
                type="button"
                disabled={isStartingAutoDj}
                onClick={() => onStartGenre ? onStartGenre(st.id) : onStartAutoDj?.()}
                className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-purple-500/50 hover:bg-purple-950/30 text-left transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <span className="text-base shrink-0">{st.icon}</span>
                <div className="truncate">
                  <p className="text-[11px] font-bold text-zinc-200 truncate">{st.name}</p>
                  <p className="text-[9px] text-zinc-500 truncate">{st.description.split(',')[0]}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenAutoDj}
            disabled={isStartingAutoDj}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-white" />
            <span>Ver Todas las Estaciones y Géneros</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </button>
        </>
      )}

      {isAutoDj && (
        <div className="flex items-center justify-center gap-1.5 bg-pink-950/40 border border-pink-500/30 px-3 py-1 rounded-xl text-pink-300 text-[11px] w-full">
          <span className="animate-spin text-xs">💿</span>
          <span>Estación activa en TV: <b>{genreInfo.displayName}</b></span>
        </div>
      )}
    </div>
  );
};

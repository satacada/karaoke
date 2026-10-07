import type { FC } from 'react';
import { Music, Radio, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { parseAutoDjGenre, AUTO_DJ_STATIONS } from '../../services/autoDjService';
import { isLocalAutoDjActive, getLocalAutoDjGenre } from '../../services/autoDjStateService';
import type { KaraokeRoom } from '../../types';

interface HostEmptyQueueCardProps {
  room: KaraokeRoom | null;
  onOpenAutoDj: () => void;
  onStartAutoDj?: () => void;
  onStartGenre?: (genre: string) => void;
  isStartingAutoDj?: boolean;
}

export const HostEmptyQueueCard: FC<HostEmptyQueueCardProps> = ({
  room, onOpenAutoDj, onStartAutoDj, onStartGenre, isStartingAutoDj = false,
}) => {
  const isAutoDj = Boolean(room?.auto_dj_enabled) || isLocalAutoDjActive(room?.room_code || 'FIESTA');
  const activeGenre = room?.auto_dj_genre || getLocalAutoDjGenre(room?.room_code || 'FIESTA') || 'cumbia_fiesta';
  const genreInfo = parseAutoDjGenre(activeGenre);

  return (
    <div className="p-4 text-center text-xs bg-zinc-900/60 rounded-3xl border border-zinc-800 flex flex-col items-center gap-3 shadow-xl">
      <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center justify-center">
        <Music className="w-5 h-5 text-purple-400" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Cola de reproducción vacía
        </h4>
        <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed">
          No hay temas solicitados. Da tu visto bueno eligiendo una estación o estilo para iniciar la música en la TV:
        </p>
      </div>

      {/* Selector rápido de estaciones directas */}
      <div className="grid grid-cols-2 gap-1.5 w-full">
        {AUTO_DJ_STATIONS.slice(0, 4).map((st) => (
          <button
            key={st.id}
            type="button"
            disabled={isStartingAutoDj}
            onClick={() => onStartGenre ? onStartGenre(st.id) : onStartAutoDj?.()}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-purple-500/50 hover:bg-purple-950/30 text-left transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <span className="text-base">{st.icon}</span>
            <div className="truncate">
              <p className="text-[11px] font-bold text-zinc-200 truncate">{st.name}</p>
              <p className="text-[9px] text-zinc-500 truncate">{st.description.split(',')[0]}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Botón principal para abrir el modal completo o iniciar */}
      <div className="w-full pt-1 flex flex-col gap-2">
        <button
          type="button"
          onClick={onOpenAutoDj}
          disabled={isStartingAutoDj}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isStartingAutoDj ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Cargando música en la TV...</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 text-white" />
              <span>Explorar Estaciones o Semilla</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </>
          )}
        </button>

        {isAutoDj && (
          <div className="flex items-center justify-center gap-1.5 bg-pink-950/40 border border-pink-500/30 px-3 py-1 rounded-xl text-pink-300 text-[11px]">
            <span className="animate-spin text-xs">💿</span>
            <span>Estación activa: {genreInfo.displayName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

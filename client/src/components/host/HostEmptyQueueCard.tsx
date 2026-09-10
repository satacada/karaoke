import type { FC } from 'react';
import { Play } from 'lucide-react';
import { parseAutoDjGenre } from '../../services/autoDjService';
import type { KaraokeRoom } from '../../types';

interface HostEmptyQueueCardProps {
  room: KaraokeRoom | null;
  onOpenAutoDj: () => void;
  onStartAutoDj?: () => void;
  isStartingAutoDj?: boolean;
}

export const HostEmptyQueueCard: FC<HostEmptyQueueCardProps> = ({
  room, onOpenAutoDj, onStartAutoDj, isStartingAutoDj = false,
}) => {
  const isAutoDj = Boolean(room?.auto_dj_enabled);
  const genreInfo = parseAutoDjGenre(room?.auto_dj_genre);

  return (
    <div className="p-4 text-center text-xs bg-zinc-900/40 rounded-2xl border border-zinc-800/50 flex flex-col items-center gap-2.5">
      <p className="text-zinc-400 font-medium">La cola de canciones está vacía</p>
      {onStartAutoDj && (
        <button
          type="button"
          onClick={onStartAutoDj}
          disabled={isStartingAutoDj}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          title="Dar click para enviar la señal e iniciar el sonido en la TV"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isStartingAutoDj ? 'Iniciando sonido...' : '▶ Iniciar Música Inteligente'}</span>
        </button>
      )}
      {isAutoDj ? (
        <div className="flex items-center gap-1.5 bg-pink-950/40 border border-pink-500/30 px-3 py-1.5 rounded-xl text-pink-300">
          <span className="animate-spin text-sm">💿</span>
          <span>Auto-DJ: {genreInfo.displayName}</span>
          <button type="button" onClick={onOpenAutoDj} className="ml-1 underline font-bold text-white hover:text-pink-200">Cambiar</button>
        </div>
      ) : (
        <button type="button" onClick={onOpenAutoDj} className="px-3 py-1 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold hover:bg-purple-600/30">Activar Auto-DJ Ambiente</button>
      )}
    </div>
  );
};

import type { FC } from 'react';
import { parseAutoDjGenre } from '../../services/autoDjService';
import type { KaraokeRoom } from '../../types';

interface HostEmptyQueueCardProps {
  room: KaraokeRoom | null;
  onOpenAutoDj: () => void;
}

export const HostEmptyQueueCard: FC<HostEmptyQueueCardProps> = ({ room, onOpenAutoDj }) => {
  const isAutoDj = Boolean(room?.auto_dj_enabled);
  const genreInfo = parseAutoDjGenre(room?.auto_dj_genre);

  return (
    <div className="p-4 text-center text-xs bg-zinc-900/40 rounded-2xl border border-zinc-800/50 flex flex-col items-center gap-2">
      <p className="text-zinc-400 font-medium">Cola vacía</p>
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

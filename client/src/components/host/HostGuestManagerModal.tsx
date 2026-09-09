import type { FC } from 'react';
import { Users, X, UserX } from 'lucide-react';
import type { QueueItem } from '../../types';

interface HostGuestManagerModalProps {
  isOpen: boolean;
  queue: QueueItem[];
  onPurgeGuest: (guestId: string, guestName: string) => void;
  onClose: () => void;
}

export const HostGuestManagerModal: FC<HostGuestManagerModalProps> = ({
  isOpen,
  queue,
  onPurgeGuest,
  onClose,
}) => {
  if (!isOpen) return null;

  // Group queue items by guest
  const guestMap = new Map<string, { guestId: string; name: string; count: number }>();
  queue.forEach((item) => {
    const key = item.guest_id || item.requested_by;
    const existing = guestMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      guestMap.set(key, {
        guestId: item.guest_id || '',
        name: item.requested_by,
        count: 1,
      });
    }
  });

  const guests = Array.from(guestMap.values());

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[80vh]">
        <header className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Users className="w-4 h-4 text-pink-400" />
            <span>Invitados con Canciones ({guests.length})</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </header>

        <p className="text-[11px] text-zinc-400 mb-3">
          Si alguien se fue del local, quita sus canciones pendientes en un solo toque:
        </p>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {guests.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No hay invitados con canciones en cola.</p>
          ) : (
            guests.map((g) => (
              <div
                key={g.name}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80"
              >
                <div>
                  <h4 className="text-xs font-semibold text-white">{g.name}</h4>
                  <span className="text-[11px] text-pink-400 font-medium">
                    {g.count} {g.count === 1 ? 'canción' : 'canciones'}
                  </span>
                </div>
                <button
                  onClick={() => onPurgeGuest(g.guestId, g.name)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold active:scale-95"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Quitar</span>
                </button>
              </div>
            ))
          )}
        </div>

        <footer className="mt-4 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold active:scale-95"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

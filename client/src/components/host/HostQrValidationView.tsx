import { useState, type FC, type FormEvent } from 'react';
import { Tv, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface HostQrValidationViewProps {
  onLinked: (roomCode: string) => void;
  defaultRoomFallback?: string;
}

export const HostQrValidationView: FC<HostQrValidationViewProps> = ({ onLinked, defaultRoomFallback = 'FIESTA' }) => {
  // El cuadro NO DEBE estar lleno por defecto; el administrador debe tipear el código visto en la TV
  const [code, setCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setIsLinking(true);
    setError(null);

    try {
      const targetRoom = clean.startsWith('TV-') ? defaultRoomFallback : clean;
      supabase.channel(`tv-room-${targetRoom}`).send({ type: 'broadcast', event: 'admin_linked', payload: {} }).catch(() => {});
      supabase.channel(`room_commands_${targetRoom}`).send({ type: 'broadcast', event: 'admin_linked', payload: {} }).catch(() => {});
      if (clean.startsWith('TV-')) {
        const ch = supabase.channel(`tv-activation-${clean}`);
        await ch.send({
          type: 'broadcast',
          event: 'paired',
          payload: { roomCode: defaultRoomFallback, roomName: 'Salón Principal' },
        });
        setTimeout(() => supabase.removeChannel(ch), 2000);
        onLinked(defaultRoomFallback);
      } else {
        onLinked(clean);
      }
    } catch (err) {
      console.error('Error al enlazar TV:', err);
      setError('No se pudo enlazar. Verifica el código e intenta de nuevo.');
      setIsLinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 select-none">
      <div className="w-full max-w-sm bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center space-y-5 backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-pink-600/30">
          <Tv className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-xl font-black text-white">Enlazar con Pantalla TV</h1>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Ingresa el código que aparece en la TV <b>debajo del código QR</b> para tomar el control como Administrador:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="Ej: FIESTA o TV-4821"
              autoFocus
              className="w-full bg-zinc-950 border-2 border-zinc-700 focus:border-pink-500 rounded-2xl py-3.5 px-4 text-center font-mono font-black text-2xl text-white uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-pink-500/50 shadow-inner transition-all placeholder:text-zinc-600 placeholder:text-base placeholder:tracking-normal placeholder:font-normal"
            />
            {error && (
              <p className="text-xs text-rose-400 font-bold mt-2 flex items-center justify-center gap-1.5 animate-bounce">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!code.trim() || isLinking}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-40"
          >
            {isLinking ? (
              <span>Enlazando con la TV...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enlazar y Tomar Control</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-zinc-500 font-mono">
          Consola DJ / Administrador Karaoke
        </p>
      </div>
    </div>
  );
};

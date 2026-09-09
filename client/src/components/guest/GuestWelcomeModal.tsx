import { useState, type FC, type FormEvent } from 'react';
import { Mic, Sparkles, MapPin } from 'lucide-react';

interface GuestWelcomeModalProps {
  isOpen: boolean;
  roomCode: string;
  onJoin: (name: string, coords?: { lat: number; lng: number }) => void;
}

export const GuestWelcomeModal: FC<GuestWelcomeModalProps> = ({ isOpen, roomCode, onJoin }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    setIsSubmitting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onJoin(cleanName, { lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsSubmitting(false);
        },
        () => {
          onJoin(cleanName);
          setIsSubmitting(false);
        },
        { timeout: 2000, enableHighAccuracy: true }
      );
    } else {
      onJoin(cleanName);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-xl font-black text-white tracking-tight mb-1">
          ¡Bienvenido a la Fiesta!
        </h2>
        <p className="text-xs text-zinc-400 mb-6">
          Estás en la sala <span className="text-emerald-400 font-mono font-bold">{roomCode}</span>.
          Ingresa tu nombre para pedir canciones y cantar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label htmlFor="guest-name" className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Tu Nombre o Apodo
            </label>
            <input
              id="guest-name"
              type="text"
              autoFocus
              maxLength={25}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: David, Caro, Lucas..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium text-sm transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] justify-center">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Verifica tu presencia en el local automáticamente</span>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-zinc-950 fill-zinc-950" />
            <span>{isSubmitting ? 'Conectando...' : '¡Empezar a pedir temas!'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

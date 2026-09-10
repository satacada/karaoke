import type { FC } from 'react';
import { Tv, Disc3, Zap, Mic2, Wine, Gamepad2, Check } from 'lucide-react';
import type { TvTheme } from '../../types';

interface MaskOption {
  id: TvTheme;
  name: string;
  desc: string;
  icon: typeof Tv;
  accent: string;
  activeBg: string;
  badge: string;
}

const MASKS: MaskOption[] = [
  { id: 'modern', name: 'Pantalla Completa', desc: 'Limpia y moderna', icon: Tv, accent: 'border-purple-500', activeBg: 'bg-purple-600/30 text-white', badge: 'bg-purple-600' },
  { id: 'vintage', name: 'Wurlitzer Retro', desc: 'Rockola 1950s', icon: Disc3, accent: 'border-amber-500', activeBg: 'bg-amber-600/30 text-amber-200', badge: 'bg-amber-600' },
  { id: 'neon_club', name: 'Cyber Club Neón', desc: 'Discoteca cian & fucsia', icon: Zap, accent: 'border-cyan-400', activeBg: 'bg-cyan-600/30 text-cyan-200', badge: 'bg-cyan-500' },
  { id: 'karaoke_party', name: 'Fiesta Glow KTV', desc: 'Cantobar festivo', icon: Mic2, accent: 'border-pink-500', activeBg: 'bg-pink-600/30 text-pink-200', badge: 'bg-pink-600' },
  { id: 'dark_lounge', name: 'Velvet Gold Lounge', desc: 'Bar acústico & pub', icon: Wine, accent: 'border-yellow-500', activeBg: 'bg-yellow-600/30 text-yellow-200', badge: 'bg-yellow-600' },
  { id: 'synthwave_80s', name: 'Synthwave 80s', desc: 'Retro arcade outrun', icon: Gamepad2, accent: 'border-orange-500', activeBg: 'bg-orange-600/30 text-orange-200', badge: 'bg-orange-500' },
];

interface HostTvMaskSelectorProps {
  selectedTheme: TvTheme;
  onSelectTheme: (theme: TvTheme) => void;
}

export const HostTvMaskSelector: FC<HostTvMaskSelectorProps> = ({ selectedTheme, onSelectTheme }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Tv className="w-3.5 h-3.5 text-pink-400" /> Máscara de Pantalla TV
        </label>
        <span className="text-[10px] text-zinc-400 font-mono">Cambio en vivo</span>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
        {MASKS.map((mask) => {
          const Icon = mask.icon;
          const isSelected = selectedTheme === mask.id;
          return (
            <button
              key={mask.id}
              type="button"
              onClick={() => onSelectTheme(mask.id)}
              className={`p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1 cursor-pointer active:scale-95 ${
                isSelected ? `${mask.accent} ${mask.activeBg} shadow-md` : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold truncate">{mask.name}</span>
                </div>
                {isSelected && (
                  <span className={`w-4 h-4 rounded-full ${mask.badge} text-white flex items-center justify-center shrink-0`}>
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 truncate">{mask.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

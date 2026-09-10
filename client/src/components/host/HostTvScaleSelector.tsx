import type { FC } from 'react';
import { ZoomIn, Check } from 'lucide-react';
import type { TvScale } from '../../types';

interface ScaleOption {
  id: TvScale;
  label: string;
  percent: string;
  desc: string;
}

const SCALES: ScaleOption[] = [
  { id: 'compact', label: 'Compacta', percent: '85%', desc: '32"-43" / Más video' },
  { id: 'normal', label: 'Estándar', percent: '100%', desc: 'Equilibrado clásico' },
  { id: 'large', label: 'Grande', percent: '115%', desc: '50"-55" / Distancia' },
  { id: 'xl', label: 'Salón KTV', percent: '130%', desc: '65"-85"+ / Pantallón' },
];

interface HostTvScaleSelectorProps {
  selectedScale: TvScale;
  onSelectScale: (scale: TvScale) => void;
}

export const HostTvScaleSelector: FC<HostTvScaleSelectorProps> = ({ selectedScale, onSelectScale }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <ZoomIn className="w-3.5 h-3.5 text-cyan-400" /> Calibrar Escala en TV (Letras + Íconos)
        </label>
        <span className="text-[10px] text-zinc-400 font-mono">En vivo</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {SCALES.map((scale) => {
          const isSelected = selectedScale === scale.id;
          return (
            <button
              key={scale.id}
              type="button"
              onClick={() => onSelectScale(scale.id)}
              className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer active:scale-95 ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-950/40'
                  : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
              title={scale.desc}
            >
              <div className="flex items-center gap-0.5">
                <span className="text-xs font-black font-mono">{scale.percent}</span>
                {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
              </div>
              <span className="text-[9px] font-bold truncate">{scale.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

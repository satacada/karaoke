import { useState, type FC } from 'react';
import { Tag, Plus, Trash2, X, Check, Sparkles, Clock } from 'lucide-react';
import type { PromoBanner, PromoDurationType } from '../../types';

interface HostBannersModalProps {
  isOpen: boolean;
  banners: PromoBanner[];
  onSave: (banners: PromoBanner[]) => Promise<void>;
  onClose: () => void;
}

const DUR_OPTS: { id: PromoDurationType; label: string }[] = [
  { id: '15m', label: '15 min' }, { id: '30m', label: '30 min' },
  { id: 'end_of_hour', label: 'Fin hora' }, { id: '1h', label: '1 hora' }, { id: 'indefinite', label: 'Siempre' },
];

const calcExpiry = (dur: PromoDurationType): number | null => {
  const now = Date.now();
  if (dur === '15m') return now + 15 * 60 * 1000;
  if (dur === '30m') return now + 30 * 60 * 1000;
  if (dur === '1h') return now + 60 * 60 * 1000;
  if (dur === 'end_of_hour') { const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0); return d.getTime(); }
  return null;
};

const DEFAULT_BANNER: Omit<PromoBanner, 'id'> = {
  title: '2x1 en Cervezas Artesanales', subtitle: 'Válido en la barra hasta las 23:30 hs 🍻',
  color: 'gold', is_active: true, duration_type: 'end_of_hour', expires_at: calcExpiry('end_of_hour'),
};

export const HostBannersModal: FC<HostBannersModalProps> = ({ isOpen, banners: initialBanners, onSave, onClose }) => {
  const [banners, setBanners] = useState<PromoBanner[]>(() => initialBanners.length ? initialBanners : [{ id: 'b1', ...DEFAULT_BANNER }]);
  const [isSaving, setIsSaving] = useState(false);
  if (!isOpen) return null;

  const handleAdd = () => {
    if (banners.length >= 4) return;
    setBanners([...banners, { id: crypto.randomUUID(), ...DEFAULT_BANNER, expires_at: calcExpiry('end_of_hour') }]);
  };
  const handleRemove = (id: string) => setBanners(banners.filter((b) => b.id !== id));
  const handleUpdate = (id: string, updates: Partial<PromoBanner>) => {
    setBanners(banners.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };
  const handleDuration = (id: string, dur: PromoDurationType) => {
    handleUpdate(id, { duration_type: dur, expires_at: calcExpiry(dur) });
  };
  const handleSave = async () => {
    setIsSaving(true); await onSave(banners); setIsSaving(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2"><Tag className="w-5 h-5 text-amber-400" /><h3 className="text-sm font-bold text-white uppercase tracking-wider">Promociones del Local en TV</h3></div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {banners.map((b, idx) => (
            <div key={b.id} className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Promo #{idx + 1}</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[11px] text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={b.is_active} onChange={(e) => handleUpdate(b.id, { is_active: e.target.checked })} className="rounded accent-emerald-500" />
                    <span>Activa</span>
                  </label>
                  {banners.length > 1 && <button onClick={() => handleRemove(b.id)} className="text-zinc-500 hover:text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
              <input type="text" value={b.title} onChange={(e) => handleUpdate(b.id, { title: e.target.value })} placeholder="Título: Ej. 2x1 en Tragos" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white" />
              <input type="text" value={b.subtitle} onChange={(e) => handleUpdate(b.id, { subtitle: e.target.value })} placeholder="Detalle: Ej. Hasta las 23 hs" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300" />
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> Tiempo en Pantalla:</span>
                  {b.expires_at && <span className="text-amber-300 font-mono">Hasta {new Date(b.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {DUR_OPTS.map((d) => (
                    <button key={d.id} type="button" onClick={() => handleDuration(b.id, d.id)} className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${b.duration_type === d.id ? 'bg-amber-500 text-zinc-950 border-amber-400' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'}`}>{d.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Color:</span>
                {(['gold', 'emerald', 'purple', 'ruby'] as const).map((c) => (
                  <button key={c} type="button" onClick={() => handleUpdate(b.id, { color: c })} className={`w-5 h-5 rounded-full border-2 transition-all ${b.color === c ? 'scale-110 border-white' : 'border-transparent opacity-50'} ${c === 'gold' ? 'bg-amber-500' : c === 'emerald' ? 'bg-emerald-500' : c === 'purple' ? 'bg-purple-500' : 'bg-rose-500'}`} />
                ))}
              </div>
            </div>
          ))}
          {banners.length < 4 && (
            <button onClick={handleAdd} className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 hover:bg-zinc-800/40">
              <Plus className="w-4 h-4" /><span>Agregar otra promoción</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 pt-2 border-t border-zinc-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold">Cancelar</button>
          <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40">
            <Check className="w-4 h-4" /><span>{isSaving ? 'Guardando...' : 'Guardar y Publicar en TV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

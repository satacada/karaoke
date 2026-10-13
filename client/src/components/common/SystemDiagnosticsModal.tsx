// ==============================================================================
// MODAL DE DIAGNÓSTICO DEL SISTEMA Y TELEMETRÍA (BUFFER 100 EVENTOS)
// Archivo: client/src/components/common/SystemDiagnosticsModal.tsx
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import { useState, useEffect, type FC } from 'react';
import { X, Copy, Check, Trash2, Bug, Terminal, ShieldAlert } from 'lucide-react';
import { getLocalLogs, clearLocalLogs, exportDiagnosticText } from '../../services/loggerService';
import { APP_VERSION } from '../../version';
import type { SystemLog } from '../../types';

interface SystemDiagnosticsModalProps {
  isOpen: boolean;
  roomCode?: string;
  onClose: () => void;
}

export const SystemDiagnosticsModal: FC<SystemDiagnosticsModalProps> = ({ isOpen, roomCode = 'FIESTA', onClose }) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) setLogs(getLocalLogs());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const text = exportDiagnosticText(roomCode);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    clearLocalLogs();
    setLogs([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Diagnóstico del Sistema</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300">{APP_VERSION}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Sala: {roomCode}</span>
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">Últimos {logs.length} eventos en memoria</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-1.5 font-mono text-[11px]">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Bug className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No hay eventos registrados en memoria aún.</p>
            </div>
          ) : (
            logs.map((log, idx) => {
              const time = log.created_at ? new Date(log.created_at).toLocaleTimeString() : '??:??';
              const isErr = log.level === 'error';
              const isWarn = log.level === 'warn';
              return (
                <div key={idx} className={`p-2 rounded-xl border flex flex-col gap-0.5 ${isErr ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' : isWarn ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'}`}>
                  <div className="flex items-center justify-between text-[9px] opacity-75">
                    <span className="font-bold flex items-center gap-1">
                      {isErr && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                      [{log.node_type.toUpperCase()}][{log.event}]
                    </span>
                    <span>{time}</span>
                  </div>
                  <p className="leading-tight font-sans text-xs break-words">{log.message}</p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <span className="text-[9px] opacity-60 truncate">Detalles: {JSON.stringify(log.details)}</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-zinc-800 flex gap-2 shrink-0">
          <button type="button" onClick={handleClear} className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" /><span>Limpiar</span>
          </button>
          <button type="button" onClick={handleCopy} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer">
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado para WhatsApp!' : 'Copiar Diagnóstico para Enviar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// SERVICIO DE TELEMETRÍA Y LOGS EN TIEMPO REAL (CAJA NEGRA)
// Archivo: client/src/services/loggerService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import type { LogLevel, LogNode, SystemLog } from '../types';

const LOCAL_LOGS_KEY = 'rockola_system_logs_cache';
const MAX_LOCAL_LOGS = 60;

function saveLocalLog(entry: SystemLog) {
  try {
    const raw = sessionStorage.getItem(LOCAL_LOGS_KEY);
    const list: SystemLog[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    sessionStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(list.slice(0, MAX_LOCAL_LOGS)));
  } catch {}
}

export function getLocalLogs(): SystemLog[] {
  try {
    const raw = sessionStorage.getItem(LOCAL_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function writeSystemLog(
  roomCode: string,
  nodeType: LogNode,
  level: LogLevel,
  event: string,
  message: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  const cleanCode = (roomCode || 'FIESTA').toUpperCase().trim();
  const entry: SystemLog = {
    room_code: cleanCode,
    node_type: nodeType,
    level,
    event,
    message,
    details,
    created_at: new Date().toISOString(),
  };

  // 1. Mostrar siempre en la consola local del navegador
  const prefix = `[${level.toUpperCase()}][${nodeType.toUpperCase()}][${event}]`;
  if (level === 'error') console.error(prefix, message, details);
  else if (level === 'warn') console.warn(prefix, message, details);
  else console.log(prefix, message, details);

  // 2. Guardar en caché local de sesión para inspección inmediata en pantalla
  saveLocalLog(entry);

  // 3. Enviar a Supabase de forma asíncrona ("fire-and-forget")
  try {
    supabase
      .from('karaoke_system_logs')
      .insert([
        {
          room_code: cleanCode,
          node_type: nodeType,
          level,
          event,
          message,
          details,
        },
      ])
      .then(({ error }) => {
        if (error && error.code !== '42P01') {
          // Si la tabla aún no fue creada o hay error de RLS, no romper la app
          console.warn('[Logger] No se pudo enviar log a Supabase:', error.message);
        }
      })
      .catch(() => {});
  } catch {}
}

export function logInfo(
  roomCode: string,
  nodeType: LogNode,
  event: string,
  message: string,
  details?: Record<string, unknown>
): void {
  writeSystemLog(roomCode, nodeType, 'info', event, message, details);
}

export function logWarn(
  roomCode: string,
  nodeType: LogNode,
  event: string,
  message: string,
  details?: Record<string, unknown>
): void {
  writeSystemLog(roomCode, nodeType, 'warn', event, message, details);
}

export function logError(
  roomCode: string,
  nodeType: LogNode,
  event: string,
  message: string,
  details?: Record<string, unknown>
): void {
  writeSystemLog(roomCode, nodeType, 'error', event, message, details);
}

export async function fetchRemoteLogs(roomCode: string, limit = 50): Promise<SystemLog[]> {
  try {
    const { data, error } = await supabase
      .from('karaoke_system_logs')
      .select('*')
      .eq('room_code', (roomCode || 'FIESTA').toUpperCase().trim())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return getLocalLogs();
    return data as SystemLog[];
  } catch {
    return getLocalLogs();
  }
}

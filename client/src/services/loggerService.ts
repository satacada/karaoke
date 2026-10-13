// ==============================================================================
// SERVICIO DE TELEMETRÍA Y LOGS EN TIEMPO REAL (BUFFER CIRCULAR 100 EVENTOS)
// Archivo: client/src/services/loggerService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import { APP_VERSION } from '../version';
import type { LogLevel, LogNode, SystemLog } from '../types';

const LOCAL_LOGS_KEY = 'rockola_circular_logs_v1';
const MAX_LOCAL_LOGS = 100;

function saveLocalLog(entry: SystemLog): void {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    const list: SystemLog[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(list.slice(0, MAX_LOCAL_LOGS)));
  } catch {}
}

export function getLocalLogs(): SystemLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearLocalLogs(): void {
  try {
    localStorage.removeItem(LOCAL_LOGS_KEY);
  } catch {}
}

export function exportDiagnosticText(roomCode = 'FIESTA'): string {
  const logs = getLocalLogs();
  const header = `=== DIAGNÓSTICO ROCKOLA DIGITAL (${APP_VERSION}) (SALA ${roomCode}) ===\nGenerado: ${new Date().toLocaleString()}\nEventos registrados: ${logs.length}\n----------------------------------------\n`;
  const body = logs.map((l) => {
    const time = l.created_at ? new Date(l.created_at).toLocaleTimeString() : '??:??:??';
    const detailStr = l.details && Object.keys(l.details).length ? ` | Detalle: ${JSON.stringify(l.details)}` : '';
    return `[${time}][${l.level.toUpperCase()}][${l.node_type.toUpperCase()}][${l.event}] ${l.message}${detailStr}`;
  }).join('\n');
  return header + body;
}

export function writeSystemLog(
  roomCode: string,
  nodeType: LogNode,
  level: LogLevel,
  event: string,
  message: string,
  details: Record<string, unknown> = {}
): void {
  const cleanCode = (roomCode || 'FIESTA').toUpperCase().trim();
  const fullDetails = { ...details, app_version: APP_VERSION };
  const entry: SystemLog = { room_code: cleanCode, node_type: nodeType, level, event, message, details: fullDetails, created_at: new Date().toISOString() };

  const prefix = `[${level.toUpperCase()}][${nodeType.toUpperCase()}][${event}]`;
  if (level === 'error') console.error(prefix, message, details);
  else if (level === 'warn') console.warn(prefix, message, details);
  else console.log(prefix, message, details);

  saveLocalLog(entry);

  // Enviar a la tabla de telemetría de Supabase de forma asíncrona segura
  supabase
    .from('karaoke_system_logs')
    .insert([{ room_code: cleanCode, node_type: nodeType, level, event, message, details }])
    .then(({ error }) => {
      if (error && error.code !== '42P01') console.warn('[Logger] Cloud error:', error.message);
    }, () => {});
}

export function logInfo(roomCode: string, nodeType: LogNode, event: string, message: string, details?: Record<string, unknown>): void {
  writeSystemLog(roomCode, nodeType, 'info', event, message, details);
}

export function logWarn(roomCode: string, nodeType: LogNode, event: string, message: string, details?: Record<string, unknown>): void {
  writeSystemLog(roomCode, nodeType, 'warn', event, message, details);
}

export function logError(roomCode: string, nodeType: LogNode, event: string, message: string, details?: Record<string, unknown>): void {
  writeSystemLog(roomCode, nodeType, 'error', event, message, details);
}

// ==============================================================================
// SERVICIO DE TELEMETRÍA Y LOGS EN TIEMPO REAL CON CAPTURA DE HARDWARE
// Archivo: client/src/services/loggerService.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import { APP_VERSION } from '../version';
import type { LogLevel, LogNode, SystemLog } from '../types';

const LOCAL_LOGS_KEY = 'rockola_circular_logs_v1';
const MAX_LOCAL_LOGS = 100;
let hasSentHw = false;

export function getDeviceHardwareInfo(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  const nav = navigator as unknown as { deviceMemory?: number; hardwareConcurrency?: number; connection?: { effectiveType?: string; downlink?: number } };
  return {
    ua: navigator.userAgent || 'unknown', screen: `${window.screen?.width || 0}x${window.screen?.height || 0} (dpr:${window.devicePixelRatio || 1})`,
    cpu: nav.hardwareConcurrency || 'unknown', ram: nav.deviceMemory ? `${nav.deviceMemory}GB` : 'unknown',
    net: nav.connection ? `${nav.connection.effectiveType || ''} ${nav.connection.downlink || 0}M` : 'unknown', app_version: APP_VERSION,
  };
}

function saveLocalLog(entry: SystemLog): void {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY); const list: SystemLog[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry); localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(list.slice(0, MAX_LOCAL_LOGS)));
  } catch {}
}
export function getLocalLogs(): SystemLog[] {
  try { const raw = localStorage.getItem(LOCAL_LOGS_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
export function clearLocalLogs(): void { try { localStorage.removeItem(LOCAL_LOGS_KEY); } catch {} }

export function exportDiagnosticText(roomCode = 'FIESTA'): string {
  const logs = getLocalLogs();
  const header = `=== DIAGNÓSTICO ROCKOLA (${APP_VERSION}) (${roomCode}) ===\nGenerado: ${new Date().toLocaleString()}\nEventos: ${logs.length}\n---\n`;
  return header + logs.map((l) => `[${l.created_at ? new Date(l.created_at).toLocaleTimeString() : '??'}][${l.level.toUpperCase()}][${l.node_type}][${l.event}] ${l.message}`).join('\n');
}

export function writeSystemLog(
  roomCode: string, nodeType: LogNode, level: LogLevel, event: string, message: string, details: Record<string, unknown> = {}
): void {
  const cleanCode = (roomCode || 'FIESTA').toUpperCase().trim();
  const includeHw = !hasSentHw || level === 'error' || event === 'room_loaded' || event === 'yt_init';
  if (includeHw) hasSentHw = true;

  const fullDetails = { ...details, app_version: APP_VERSION, ...(includeHw ? { hw: getDeviceHardwareInfo() } : {}) };
  const entry: SystemLog = { room_code: cleanCode, node_type: nodeType, level, event, message, details: fullDetails, created_at: new Date().toISOString() };

  if (level === 'error') console.error(`[${level.toUpperCase()}][${nodeType}][${event}]`, message, fullDetails);
  else console.log(`[${level.toUpperCase()}][${nodeType}][${event}]`, message, fullDetails);

  saveLocalLog(entry);
  supabase.from('karaoke_system_logs')
    .insert([{ room_code: cleanCode, node_type: nodeType, level, event, message, details: fullDetails }])
    .then(({ error }) => { if (error && error.code !== '42P01') console.warn('[Logger] Cloud error:', error.message); }, () => {});
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

export function initGlobalErrorCapture(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (e) => {
    logError('GLOBAL', 'tv', 'uncaught_error', e.message || 'Error no capturado', { file: e.filename, line: e.lineno, col: e.colno, stack: e.error?.stack || String(e.error) });
  });
  window.addEventListener('unhandledrejection', (e) => {
    logError('GLOBAL', 'tv', 'unhandled_rejection', String(e.reason?.message || e.reason), { stack: e.reason?.stack });
  });
  logInfo('GLOBAL', 'tv', 'telemetry_initialized', 'Telemetría de hardware iniciada', { hw: getDeviceHardwareInfo() });
}

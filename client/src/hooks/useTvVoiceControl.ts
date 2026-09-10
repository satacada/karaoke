import { useState, useRef, useEffect, useCallback } from 'react';

export type VoiceAction = 'pause' | 'play' | 'next' | 'start_auto_dj' | 'stop_auto_dj';

interface UseTvVoiceControlOptions {
  onPause: () => void;
  onPlay: () => void;
  onNext: () => void;
  onStartAutoDj: () => void;
  onStopAutoDj: () => void;
}

export function useTvVoiceControl({ onPause, onPlay, onNext, onStartAutoDj, onStopAutoDj }: UseTvVoiceControlOptions) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const callbacksRef = useRef({ onPause, onPlay, onNext, onStartAutoDj, onStopAutoDj });
  callbacksRef.current = { onPause, onPlay, onNext, onStartAutoDj, onStopAutoDj };

  const parseCommand = useCallback((text: string): VoiceAction | null => {
    const t = text.toLowerCase().trim();
    if (t.includes('pausa') || t.includes('parar') || t.includes('detener') || t.includes('alto')) return 'pause';
    if (t.includes('continuar') || t.includes('reanudar') || t.includes('play') || t.includes('reproducir')) return 'play';
    if (t.includes('siguiente') || t.includes('saltar') || t.includes('pasar') || t.includes('otro tema')) return 'next';
    if (t.includes('apagar dj') || t.includes('quitar dj') || t.includes('detener dj') || t.includes('parar dj')) return 'stop_auto_dj';
    if (t.includes('dj') || t.includes('inteligente') || t.includes('poner musica') || t.includes('iniciar musica')) return 'start_auto_dj';
    return null;
  }, []);

  const handleSpeechResult = useCallback((text: string) => {
    const action = parseCommand(text);
    if (!action) return;
    setLastCommand(text);
    setTimeout(() => setLastCommand(null), 3500);

    const c = callbacksRef.current;
    if (action === 'pause') c.onPause();
    else if (action === 'play') c.onPlay();
    else if (action === 'next') c.onNext();
    else if (action === 'start_auto_dj') c.onStartAutoDj();
    else if (action === 'stop_auto_dj') c.onStopAutoDj();
  }, [parseCommand]);

  const startVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    try {
      if (recRef.current) recRef.current.abort();
      const rec = new SpeechRec();
      rec.lang = 'es-ES';
      rec.continuous = true;
      rec.interimResults = false;
      rec.onstart = () => setIsListening(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (e: any) => {
        const lastIdx = e.results.length - 1;
        const transcript = e.results[lastIdx]?.[0]?.transcript;
        if (transcript) handleSpeechResult(transcript);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => {
        setIsListening(false);
        // Reinicio automático para Smart TV si sigue montado
        setTimeout(() => { try { rec.start(); } catch {} }, 1000);
      };
      recRef.current = rec;
      rec.start();
    } catch { setIsListening(false); }
  }, [handleSpeechResult]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasSpeech = Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setIsSupported(hasSpeech);
  }, []);

  return { isListening, lastCommand, isSupported, startVoice };
}

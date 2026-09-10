import { useState, useRef, useCallback } from 'react';

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function useSpeechToText(onResult: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechError('Tu navegador no admite micrófono. Escribe en el buscador.');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }
    try {
      if (recRef.current) recRef.current.abort();
      const rec: SpeechRecognitionLike = new SpeechRec();
      rec.lang = navigator.language || 'es-ES';
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => { setIsListening(true); setSpeechError(null); };
      rec.onresult = (e) => {
        const text = e.results[0]?.[0]?.transcript;
        if (text) onResult(text.trim());
        setIsListening(false);
      };
      rec.onerror = (e) => {
        setIsListening(false);
        if (e.error !== 'no-speech') {
          setSpeechError('No se detectó la voz. Intenta hablar más cerca.');
          setTimeout(() => setSpeechError(null), 3000);
        }
      };
      rec.onend = () => setIsListening(false);
      recRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
    }
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recRef.current) recRef.current.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return { isListening, speechError, toggleListening };
}

import { useState, type FC } from 'react';
import { ShieldCheck, Lock, Delete } from 'lucide-react';

interface HostAuthProps {
  expectedPin: string;
  roomCode: string;
  onAuthenticated: () => void;
}

export const HostAuth: FC<HostAuthProps> = ({ expectedPin, roomCode, onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKey = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        if (newPin === expectedPin) {
          onAuthenticated();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 select-none">
      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center mb-4 text-pink-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-1 text-center">Consola DJ Anfitrión</h1>
        <p className="text-xs text-zinc-400 mb-6 font-mono">SALA: {roomCode}</p>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500'
                  : pin.length > i
                  ? 'border-pink-500 bg-pink-500 shadow-md shadow-pink-500/50'
                  : 'border-zinc-700 bg-zinc-900'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-semibold mb-4 animate-bounce">
            PIN incorrecto. Intenta de nuevo.
          </p>
        )}

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKey(num)}
              className="h-16 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-2xl font-bold text-white active:bg-pink-600 active:scale-95 transition-all shadow-md"
            >
              {num}
            </button>
          ))}
          <div className="h-16 flex items-center justify-center text-zinc-600">
            <Lock className="w-5 h-5" />
          </div>
          <button
            onClick={() => handleKey('0')}
            className="h-16 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-2xl font-bold text-white active:bg-pink-600 active:scale-95 transition-all shadow-md"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-400 active:bg-zinc-800 active:scale-95 transition-all shadow-md"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

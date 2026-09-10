import type { FC } from 'react';

interface GuestGenreChipsProps {
  currentQuery: string;
  onSelectGenre: (genreQuery: string) => void;
}

const GENRE_CHIPS = [
  { id: '80s', label: 'Música 80s', query: 'musica de los 80', icon: '⚡' },
  { id: 'rock_80s', label: 'Rock 80s', query: 'rock de los 80', icon: '🎸' },
  { id: 'salsa', label: 'Salsa', query: 'salsa', icon: '💃' },
  { id: 'cumbia', label: 'Cumbia', query: 'cumbia', icon: '🌴' },
  { id: 'reggaeton', label: 'Reggaetón', query: 'reggaeton', icon: '🔥' },
  { id: 'blues', label: 'Blues', query: 'blues', icon: '🎷' },
  { id: '90s', label: 'Hits 90s', query: 'musica de los 90', icon: '📻' },
  { id: 'rock_roll', label: 'Rock & Roll', query: 'rock and roll', icon: '🎙️' },
  { id: 'baladas', label: 'Baladas', query: 'baladas', icon: '❤️' },
];

export const GuestGenreChips: FC<GuestGenreChipsProps> = ({ currentQuery, onSelectGenre }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
      {GENRE_CHIPS.map((g) => {
        const isSelected = currentQuery.toLowerCase().trim() === g.query.toLowerCase();
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => onSelectGenre(g.query)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all active:scale-95 ${
              isSelected
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400'
                : 'bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span>{g.icon}</span>
            <span>{g.label}</span>
          </button>
        );
      })}
    </div>
  );
};

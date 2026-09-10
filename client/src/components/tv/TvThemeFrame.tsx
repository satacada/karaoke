import type { FC, ReactNode } from 'react';
import type { TvTheme } from '../../types';
import { TvVintageFrame } from './TvVintageFrame';
import { TvNeonClubFrame } from './TvNeonClubFrame';
import { TvPartyFrame } from './TvPartyFrame';
import { TvLoungeFrame } from './TvLoungeFrame';
import { TvSynthwaveFrame } from './TvSynthwaveFrame';

interface TvThemeFrameProps {
  theme: TvTheme;
  children: ReactNode;
}

export const TvThemeFrame: FC<TvThemeFrameProps> = ({ theme, children }) => {
  switch (theme) {
    case 'vintage':
      return <TvVintageFrame active>{children}</TvVintageFrame>;
    case 'neon_club':
      return <TvNeonClubFrame>{children}</TvNeonClubFrame>;
    case 'karaoke_party':
      return <TvPartyFrame>{children}</TvPartyFrame>;
    case 'dark_lounge':
      return <TvLoungeFrame>{children}</TvLoungeFrame>;
    case 'synthwave_80s':
      return <TvSynthwaveFrame>{children}</TvSynthwaveFrame>;
    case 'modern':
    default:
      return <div className="relative w-full h-full">{children}</div>;
  }
};

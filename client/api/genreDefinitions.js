export const GENRE_SEEDS = [
  {
    matcher: /80|ochenta/i,
    subMatchers: [
      { matcher: /rock/i, artists: ['Soda Stereo', 'Queen', 'Guns N Roses', 'Bon Jovi', 'The Police', 'Charly Garcia'] },
      { matcher: /pop/i, artists: ['Michael Jackson', 'Madonna', 'Cyndi Lauper', 'Wham', 'a-ha', 'Whitney Houston'] },
      { matcher: /balada|romant/i, artists: ['Ricardo Montaner', 'Luis Miguel', 'Jose Jose', 'Roberto Carlos'] },
    ],
    defaultArtists: ['Queen', 'Michael Jackson', 'Soda Stereo', 'Madonna', 'Bon Jovi', 'a-ha']
  },
  {
    matcher: /90|noventa/i,
    subMatchers: [
      { matcher: /rock/i, artists: ['Nirvana', 'Oasis', 'Red Hot Chili Peppers', 'Aerosmith', 'Los Piojos', 'La Renga'] },
      { matcher: /pop/i, artists: ['Britney Spears', 'Backstreet Boys', 'Spice Girls', 'Shakira'] },
    ],
    defaultArtists: ['Nirvana', 'Backstreet Boys', 'Oasis', 'Britney Spears', 'Los Redondos']
  },
  {
    matcher: /rock(\s+and\s+roll|\s+roll)?/i,
    subMatchers: [
      { matcher: /nacional|argentino/i, artists: ['Soda Stereo', 'Charly Garcia', 'Fito Paez', 'Los Redondos', 'Andres Calamaro'] },
      { matcher: /clasico|classic/i, artists: ['Queen', 'AC/DC', 'Led Zeppelin', 'The Rolling Stones', 'Guns N Roses'] },
      { matcher: /roll/i, artists: ['Elvis Presley', 'Chuck Berry', 'Little Richard', 'The Beatles', 'Jerry Lee Lewis'] },
    ],
    defaultArtists: ['Queen', 'Soda Stereo', 'Bon Jovi', 'Guns N Roses', 'AC/DC', 'Charly Garcia']
  },
  {
    matcher: /salsa/i,
    defaultArtists: ['Hector Lavoe', 'Marc Anthony', 'Frankie Ruiz', 'Willie Colon', 'Grupo Niche', 'Ruben Blades']
  },
  {
    matcher: /blues|bluet/i,
    defaultArtists: ['BB King', 'Eric Clapton', 'Muddy Waters', 'Stevie Ray Vaughan', 'Gary Moore', 'Buddy Guy']
  },
  {
    matcher: /reguet[oó]n|reggaeton|perreo/i,
    defaultArtists: ['Daddy Yankee', 'Don Omar', 'Wisin Y Yandel', 'Bad Bunny', 'J Balvin', 'Ozuna']
  },
  {
    matcher: /cumbia|cuarteto/i,
    defaultArtists: ['Los Palmeras', 'Damas Gratis', 'Gilda', 'Rafaga', 'Rodrigo', 'La Mona Jimenez', 'La Konga']
  },
  {
    matcher: /balada|bolero|romant/i,
    defaultArtists: ['Luis Miguel', 'Ricardo Montaner', 'Cristian Castro', 'Jose Jose', 'Marco Antonio Solis', 'Camilo Sesto']
  },
  {
    matcher: /disco|funk/i,
    defaultArtists: ['Bee Gees', 'Earth Wind and Fire', 'ABBA', 'Donna Summer', 'Kool and the Gang']
  }
];

export function getGenreArtists(query) {
  if (!query || typeof query !== 'string') return null;
  const q = query.trim().toLowerCase();
  for (const g of GENRE_SEEDS) {
    if (g.matcher.test(q)) {
      if (g.subMatchers) {
        for (const sub of g.subMatchers) {
          if (sub.matcher.test(q)) return sub.artists;
        }
      }
      return g.defaultArtists;
    }
  }
  return null;
}

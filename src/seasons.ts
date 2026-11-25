import { Seasons } from 'astronomy-engine';

import type { Season } from '@sky/types';

export const seasonsOf = (year: number): Season[] => {
  const found = Seasons(year);

  return [
    { season: 'marchEquinox', at: found.mar_equinox.date },
    { season: 'juneSolstice', at: found.jun_solstice.date },
    { season: 'septemberEquinox', at: found.sep_equinox.date },
    { season: 'decemberSolstice', at: found.dec_solstice.date },
  ];
};

export const nextSeason = (after: Date): Season => {
  const year = after.getUTCFullYear();

  return [...seasonsOf(year), ...seasonsOf(year + 1)].find(
    ({ at }) => at > after,
  ) as Season;
};

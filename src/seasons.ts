import { Seasons } from 'astronomy-engine';

import type { Season } from '@sky/types';
import { assertInstant } from '@sky/validate';

/**
 * The four equinoxes and solstices of a calendar year (UTC), in order: March equinox, June solstice, September equinox, December solstice.
 * @throws RangeError when `year` is not a whole number
 */
export const seasonsOf = (year: number): Season[] => {
  if (!Number.isSafeInteger(year)) {
    throw new RangeError(`Expected a whole year such as 2027, got ${year}`);
  }

  const found = Seasons(year);

  return [
    { season: 'marchEquinox', at: found.mar_equinox.date },
    { season: 'juneSolstice', at: found.jun_solstice.date },
    { season: 'septemberEquinox', at: found.sep_equinox.date },
    { season: 'decemberSolstice', at: found.dec_solstice.date },
  ];
};

/**
 * The first equinox or solstice strictly after `after`; looks into the next year when this year's are over.
 * @throws RangeError when `after` is an invalid Date
 */
export const nextSeason = (after: Date): Season => {
  assertInstant({ at: after, name: 'after' });

  const year = after.getUTCFullYear();

  return [...seasonsOf(year), ...seasonsOf(year + 1)].find(
    ({ at }) => at > after,
  ) as Season;
};

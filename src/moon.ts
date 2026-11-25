import {
  type MoonQuarter as EngineQuarter,
  NextMoonQuarter,
  SearchMoonQuarter,
} from 'astronomy-engine';

import { moonDistanceKm } from '@sky/bodies';
import type { MoonPhase, MoonQuarter, Range } from '@sky/types';
import { assertRange, assertTimeZone } from '@sky/validate';
import { dayOf } from '@sky/zone';

const QUARTERS: MoonQuarter[] = ['new', 'first', 'full', 'last'];
const LOOK_BACK_DAYS = 35;
const MS_PER_DAY = 86_400_000;
const MONTH_LENGTH = 7;

/** A full moon nearer than this many kilometres counts as a supermoon. */
export const SUPERMOON_KM = 360_000;

interface Quarter {
  phase: MoonQuarter;
  at: Date;
}

const quartersBetween = ({ from, to }: Range): Quarter[] => {
  const walk = (next: EngineQuarter): Quarter[] =>
    +next.time.date < +to
      ? [
          { phase: QUARTERS[next.quarter], at: next.time.date },
          ...walk(NextMoonQuarter(next)),
        ]
      : [];

  return walk(SearchMoonQuarter(from));
};

/**
 * The new, first-quarter, full and last-quarter moons from `from` up to `to`, in time order.
 *
 * `distanceKm`, `isSuper` and `isBlue` are only meaningful for `full` (`distanceKm` is `0` for the other phases).
 * `isBlue` is the second full moon of a calendar month in `timeZone`.
 *
 * @param timeZone - IANA zone used to decide which calendar month a full moon falls in
 * @throws RangeError when `from` is after `to`, a date is invalid, or the time zone is unknown
 */
export const moonPhases = ({
  from,
  to,
  timeZone,
  supermoonKm = SUPERMOON_KM,
}: Range & { timeZone: string; supermoonKm?: number }): MoonPhase[] => {
  assertRange({ from, to });
  assertTimeZone(timeZone);

  const all = quartersBetween({
    from: new Date(+from - LOOK_BACK_DAYS * MS_PER_DAY),
    to,
  });
  const monthOf = (at: Date) => dayOf({ at, timeZone }).slice(0, MONTH_LENGTH);
  const fulls = all.filter(({ phase }) => phase === 'full');

  return all
    .filter(({ at }) => +at >= +from)
    .map(({ phase, at }) => {
      const distanceKm = phase === 'full' ? moonDistanceKm(at) : 0;

      return {
        phase,
        at,
        distanceKm,
        isSuper: phase === 'full' && distanceKm <= supermoonKm,
        isBlue:
          phase === 'full' &&
          fulls.some(
            (other) => +other.at < +at && monthOf(other.at) === monthOf(at),
          ),
      };
    });
};

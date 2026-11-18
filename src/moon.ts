import {
  type MoonQuarter as EngineQuarter,
  NextMoonQuarter,
  SearchMoonQuarter,
} from 'astronomy-engine';

import { moonDistanceKm } from '@sky/bodies';
import type { MoonPhase, MoonQuarter, Range } from '@sky/types';
import { dayOf } from '@sky/zone';

const QUARTERS: MoonQuarter[] = ['new', 'first', 'full', 'last'];
const LOOK_BACK_DAYS = 35;
const MS_PER_DAY = 86_400_000;
const MONTH_LENGTH = 7;

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

export const moonPhases = ({
  from,
  to,
  timeZone,
  supermoonKm = SUPERMOON_KM,
}: Range & { timeZone: string; supermoonKm?: number }): MoonPhase[] => {
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

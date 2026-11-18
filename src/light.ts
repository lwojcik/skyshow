import { riseSet, sunCrossing } from '@sky/bodies';
import type { Altitudes, DayLight, Place } from '@sky/types';

export const DEFAULT_ALTITUDES: Altitudes = {
  goldenTop: 6,
  goldenBottom: -4,
  blueBottom: -8,
  astronomicalNight: -18,
};

const NAMES = [
  'sunrise',
  'sunset',
  'blueMorning',
  'goldenMorning',
  'morningEnd',
  'eveningStart',
  'goldenEvening',
  'blueEvening',
] as const;

export const lightOfDay = ({
  date,
  place,
  altitudes = DEFAULT_ALTITUDES,
}: {
  date: string;
  place: Place;
  altitudes?: Altitudes;
}): DayLight | null => {
  const crossing = ({
    altitude,
    way,
  }: {
    altitude: number;
    way: 'rise' | 'set';
  }) => sunCrossing({ date, altitude, way, place });
  const found = {
    sunrise: riseSet({ body: 'sun', way: 'rise', date, place }),
    sunset: riseSet({ body: 'sun', way: 'set', date, place }),
    blueMorning: crossing({ altitude: altitudes.blueBottom, way: 'rise' }),
    goldenMorning: crossing({ altitude: altitudes.goldenBottom, way: 'rise' }),
    morningEnd: crossing({ altitude: altitudes.goldenTop, way: 'rise' }),
    eveningStart: crossing({ altitude: altitudes.goldenTop, way: 'set' }),
    goldenEvening: crossing({ altitude: altitudes.goldenBottom, way: 'set' }),
    blueEvening: crossing({ altitude: altitudes.blueBottom, way: 'set' }),
  };

  if (NAMES.some((name) => found[name] === null)) {
    return null;
  }

  return {
    date,
    ...(found as Record<(typeof NAMES)[number], string>),
    astronomicalNightStart: crossing({
      altitude: altitudes.astronomicalNight,
      way: 'set',
    }),
  };
};

import { riseSet, sunCrossing } from '@sky/bodies';
import type { Altitudes, DayLight, Place } from '@sky/types';
import { assertDate, assertPlace } from '@sky/validate';

/** Sun altitudes, in degrees, that bound the golden hour (−4° to +6°), the blue hour (−8° to −4°) and astronomical night (−18°). */
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

/**
 * Sunrise, sunset and the golden and blue hours of one local day at a place.
 *
 * All times are local clock strings `YYYY-MM-DDTHH:MM:SS` in `place.timeZone`, rounded to the minute.
 * Returns `null` when any of the crossings does not happen that day (near the poles).
 * `astronomicalNightStart` alone is `null` when the sun never gets below the astronomical-night altitude.
 *
 * @param date - the local day, `YYYY-MM-DD`
 * @param altitudes - override {@link DEFAULT_ALTITUDES}
 * @throws RangeError on a malformed date or an invalid place
 * @example
 * lightOfDay({ date: '2027-12-21', place: { latitude: 52.2319, longitude: 21.0067, elevation: 100, timeZone: 'Europe/Warsaw' } });
 */
export const lightOfDay = ({
  date,
  place,
  altitudes = DEFAULT_ALTITUDES,
}: {
  date: string;
  place: Place;
  altitudes?: Altitudes;
}): DayLight | null => {
  assertDate(date);
  assertPlace(place);

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

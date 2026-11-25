import {
  EclipseKind,
  type LocalSolarEclipseInfo,
  type LunarEclipseInfo,
  NextLocalSolarEclipse,
  NextLunarEclipse,
  Observer,
  SearchLocalSolarEclipse,
  SearchLunarEclipse,
} from 'astronomy-engine';

import { bodyAltitude } from '@sky/bodies';
import type {
  LunarEclipse,
  Place,
  Range,
  SolarEclipse,
  VisibleEclipses,
} from '@sky/types';
import { assertPlace, assertRange } from '@sky/validate';

/** Default share (0 to 1) of the sun's disc a solar eclipse must hide to be reported. */
export const MIN_SOLAR_OBSCURATION = 0.1;

const observerOf = (place: Place) =>
  new Observer(place.latitude, place.longitude, place.elevation);

const lunarBetween = ({ from, to }: Range): LunarEclipseInfo[] => {
  const walk = (next: LunarEclipseInfo): LunarEclipseInfo[] =>
    +next.peak.date < +to ? [next, ...walk(NextLunarEclipse(next.peak))] : [];

  return walk(SearchLunarEclipse(from));
};

const solarBetween = ({
  from,
  to,
  place,
}: Range & { place: Place }): LocalSolarEclipseInfo[] => {
  const walk = (next: LocalSolarEclipseInfo): LocalSolarEclipseInfo[] =>
    +next.peak.time.date < +to
      ? [
          next,
          ...walk(NextLocalSolarEclipse(next.peak.time, observerOf(place))),
        ]
      : [];

  return walk(SearchLocalSolarEclipse(from, observerOf(place)));
};

/**
 * The eclipses seen from a place between `from` and `to`.
 *
 * Lunar: partial or total only (penumbral ones are left out) with the moon above the horizon at the peak.
 * Solar: hiding at least `minSolarObscuration` of the sun, with the sun above the horizon at the peak.
 *
 * @throws RangeError when `from` is after `to`, a date is invalid, or the place is invalid
 */
export const visibleEclipses = ({
  from,
  to,
  place,
  minSolarObscuration = MIN_SOLAR_OBSCURATION,
}: Range & {
  place: Place;
  minSolarObscuration?: number;
}): VisibleEclipses => {
  assertRange({ from, to });
  assertPlace(place);

  return {
    lunar: lunarBetween({ from, to })
      .filter(({ kind }) => kind !== EclipseKind.Penumbral)
      .map((found): LunarEclipse => ({
        kind: found.kind === EclipseKind.Total ? 'total' : 'partial',
        peak: found.peak.date,
        obscuration: found.obscuration,
        partialMinutes: found.sd_partial,
        totalMinutes: found.sd_total,
        moonAltitude: bodyAltitude({
          body: 'moon',
          at: found.peak.date,
          place,
        }),
      }))
      .filter(({ moonAltitude }) => moonAltitude > 0),
    solar: solarBetween({ from, to, place })
      .map((found): SolarEclipse => ({
        kind: found.kind as SolarEclipse['kind'],
        obscuration: found.obscuration,
        begin: found.partial_begin.time.date,
        peak: found.peak.time.date,
        end: found.partial_end.time.date,
        sunAltitude: found.peak.altitude,
      }))
      .filter(
        ({ obscuration, sunAltitude }) =>
          obscuration >= minSolarObscuration && sunAltitude > 0,
      ),
  };
};

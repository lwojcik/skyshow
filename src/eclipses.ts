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

export const visibleEclipses = ({
  from,
  to,
  place,
  minSolarObscuration = MIN_SOLAR_OBSCURATION,
}: Range & {
  place: Place;
  minSolarObscuration?: number;
}): VisibleEclipses => ({
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
});

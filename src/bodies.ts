import {
  Body,
  Equator,
  GeoMoon,
  Horizon,
  Illumination,
  MakeTime,
  Observer,
  SearchAltitude,
  SearchRiseSet,
} from 'astronomy-engine';

import type { Celestial, Place, Way } from '@sky/types';
import { addDays, localToInstant, toMinute } from '@sky/zone';

const KM_PER_AU = 149_597_870.7;
const MS_PER_DAY = 86_400_000;

const BODIES = { sun: Body.Sun, moon: Body.Moon };

const DIRECTIONS = { rise: 1, set: -1 };

const observerOf = (place: Place) =>
  new Observer(place.latitude, place.longitude, place.elevation);

const dayRange = ({ date, timeZone }: { date: string; timeZone: string }) => {
  const start = localToInstant({ local: `${date}T00:00:00`, timeZone });
  const end = localToInstant({
    local: `${addDays({ date, days: 1 })}T00:00:00`,
    timeZone,
  });

  return { start: new Date(start), end, limitDays: (end - start) / MS_PER_DAY };
};

const withinDay = ({
  found,
  end,
}: {
  found: { date: Date } | null;
  end: number;
}): Date | null => (found !== null && +found.date < end ? found.date : null);

export const riseSet = ({
  body,
  way,
  date,
  place,
}: {
  body: Celestial;
  way: Way;
  date: string;
  place: Place;
}): string | null => {
  const { start, end, limitDays } = dayRange({
    date,
    timeZone: place.timeZone,
  });
  const found = withinDay({
    found: SearchRiseSet(
      BODIES[body],
      observerOf(place),
      DIRECTIONS[way],
      start,
      limitDays,
    ),
    end,
  });

  return found && toMinute({ at: found, timeZone: place.timeZone });
};

export const sunCrossing = ({
  altitude,
  way,
  date,
  place,
}: {
  altitude: number;
  way: Way;
  date: string;
  place: Place;
}): string | null => {
  const { start, end, limitDays } = dayRange({
    date,
    timeZone: place.timeZone,
  });
  const found = withinDay({
    found: SearchAltitude(
      Body.Sun,
      observerOf(place),
      DIRECTIONS[way],
      start,
      limitDays,
      altitude,
    ),
    end,
  });

  return found && toMinute({ at: found, timeZone: place.timeZone });
};

export const moonIllumination = (at: Date): number =>
  Illumination(Body.Moon, MakeTime(at)).phase_fraction;

export const bodyAltitude = ({
  body,
  at,
  place,
}: {
  body: Celestial;
  at: Date;
  place: Place;
}): number => {
  const time = MakeTime(at);
  const observer = observerOf(place);
  const equator = Equator(BODIES[body], time, observer, true, true);

  return Horizon(time, observer, equator.ra, equator.dec, 'normal').altitude;
};

export const moonDistanceKm = (at: Date): number =>
  GeoMoon(at).Length() * KM_PER_AU;

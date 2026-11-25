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
import { assertDate, assertPlace } from '@sky/validate';
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

/**
 * Local clock time (`YYYY-MM-DDTHH:MM:SS`, to the minute) when the sun or moon rises or sets on a local day, or `null` if it does not that day.
 * @throws RangeError on a malformed date or an invalid place
 */
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
  assertDate(date);
  assertPlace(place);

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

/**
 * Local clock time (`YYYY-MM-DDTHH:MM:SS`, to the minute) when the sun rises or sets through `altitude` degrees on a local day, or `null` if it does not that day.
 * @throws RangeError on a malformed date or an invalid place
 */
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
  assertDate(date);
  assertPlace(place);

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

/** Illuminated fraction of the moon's disc at an instant, 0 (new) to 1 (full). */
export const moonIllumination = (at: Date): number =>
  Illumination(Body.Moon, MakeTime(at)).phase_fraction;

/** Altitude in degrees above the horizon (negative is below), refraction included, of the sun or moon seen from a place at an instant. */
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

/** Distance from the centre of the earth to the centre of the moon at an instant, in kilometres. */
export const moonDistanceKm = (at: Date): number =>
  GeoMoon(at).Length() * KM_PER_AU;

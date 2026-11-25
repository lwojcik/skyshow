import { bodyAltitude, moonIllumination, sunCrossing } from '@sky/bodies';
import { sunReaches } from '@sky/sun-longitude';
import type { MeteorShower, Place, Range, ShowerNight } from '@sky/types';
import { assertPlace, assertRange } from '@sky/validate';
import { addDays, dayOf, localToInstant } from '@sky/zone';

/** The nine meteor showers with a ZHR of 10 or more from the International Meteor Organization's working list. `degrees` is the sun's ecliptic longitude (J2000 equinox) at the peak; `activeFrom`/`activeTo` are `MM-DD`. */
export const METEOR_SHOWERS: MeteorShower[] = [
  {
    slug: 'quadrantids',
    name: 'Quadrantids',
    degrees: 283.15,
    zhr: 80,
    activeFrom: '12-28',
    activeTo: '01-12',
  },
  {
    slug: 'lyrids',
    name: 'Lyrids',
    degrees: 32.32,
    zhr: 18,
    activeFrom: '04-14',
    activeTo: '04-30',
  },
  {
    slug: 'eta-aquariids',
    name: 'Eta Aquariids',
    degrees: 45.5,
    zhr: 50,
    activeFrom: '04-19',
    activeTo: '05-28',
  },
  {
    slug: 'southern-delta-aquariids',
    name: 'Southern Delta Aquariids',
    degrees: 128,
    zhr: 25,
    activeFrom: '07-12',
    activeTo: '08-23',
  },
  {
    slug: 'perseids',
    name: 'Perseids',
    degrees: 140,
    zhr: 110,
    activeFrom: '07-17',
    activeTo: '08-24',
  },
  {
    slug: 'orionids',
    name: 'Orionids',
    degrees: 208,
    zhr: 20,
    activeFrom: '10-02',
    activeTo: '11-07',
  },
  {
    slug: 'leonids',
    name: 'Leonids',
    degrees: 235.27,
    zhr: 15,
    activeFrom: '11-06',
    activeTo: '11-30',
  },
  {
    slug: 'geminids',
    name: 'Geminids',
    degrees: 262.2,
    zhr: 150,
    activeFrom: '12-04',
    activeTo: '12-20',
  },
  {
    slug: 'ursids',
    name: 'Ursids',
    degrees: 270.7,
    zhr: 10,
    activeFrom: '12-17',
    activeTo: '12-26',
  },
];

/** Sun altitude, in degrees, that ends dusk and starts dawn for a shower night. */
export const CIVIL_TWILIGHT = -6;
/** Local hour (after midnight) taken as the middle of the night when picking the night nearest a peak. */
export const NIGHT_CENTRE_HOUR = 1;

const YEAR_DAYS = 366;
const YEAR_LENGTH = 4;

interface NightOptions {
  civilTwilight?: number;
  nightCentreHour?: number;
}

const nightOf = ({
  peak,
  place,
  centreHour,
}: {
  peak: Date;
  place: Place;
  centreHour: number;
}): string => {
  const { timeZone } = place;
  const day = dayOf({ at: peak, timeZone });
  const centre = (date: string) =>
    localToInstant({
      local: `${date}T${String(centreHour).padStart(2, '0')}:00:00`,
      timeZone,
    });
  const before = addDays({ date: day, days: -1 });

  return Math.abs(+peak - centre(day)) <
    Math.abs(+peak - centre(addDays({ date: day, days: 1 })))
    ? before
    : day;
};

const nightFor = ({
  shower,
  peak,
  place,
  civilTwilight,
  nightCentreHour,
}: NightOptions & {
  shower: MeteorShower;
  peak: Date;
  place: Place;
  civilTwilight: number;
  nightCentreHour: number;
}): ShowerNight | null => {
  const nightStart = nightOf({ peak, place, centreHour: nightCentreHour });
  const end = addDays({ date: nightStart, days: 1 });
  const dusk = sunCrossing({
    date: nightStart,
    altitude: civilTwilight,
    way: 'set',
    place,
  });
  const dawn = sunCrossing({
    date: end,
    altitude: civilTwilight,
    way: 'rise',
    place,
  });

  if (dusk === null || dawn === null) {
    return null;
  }

  const midnight = new Date(
    localToInstant({ local: `${end}T00:00:00`, timeZone: place.timeZone }),
  );

  return {
    shower,
    peak,
    nightStart,
    dusk,
    dawn,
    moonIllumination: moonIllumination(midnight),
    moonIsUp: bodyAltitude({ body: 'moon', at: midnight, place }) > 0,
  };
};

/**
 * The meteor shower peaks that fall between `from` and `to`, each with the night nearest the peak.
 *
 * `nightStart` is the local day the night begins on; `dusk` and `dawn` are local clock strings (`YYYY-MM-DDTHH:MM:SS`).
 * `moonIllumination` is 0 to 1 at local midnight, `moonIsUp` whether the moon is above the horizon then.
 * A night without civil twilight at the place (high latitude in summer) is left out.
 *
 * @throws RangeError when `from` is after `to`, a date is invalid, or the place is invalid
 */
export const showerNights = ({
  from,
  to,
  place,
  civilTwilight = CIVIL_TWILIGHT,
  nightCentreHour = NIGHT_CENTRE_HOUR,
}: Range & { place: Place } & NightOptions): ShowerNight[] => {
  assertRange({ from, to });
  assertPlace(place);

  const first = Number(
    dayOf({ at: from, timeZone: place.timeZone }).slice(0, YEAR_LENGTH),
  );
  const last = Number(
    dayOf({ at: to, timeZone: place.timeZone }).slice(0, YEAR_LENGTH),
  );
  const fromDay = dayOf({ at: from, timeZone: place.timeZone });
  const toDay = dayOf({ at: to, timeZone: place.timeZone });

  return Array.from({ length: last - first + 1 }, (_, index) => first + index)
    .flatMap((year) =>
      METEOR_SHOWERS.map((shower) => ({
        shower,
        peak: sunReaches({
          degrees: shower.degrees,
          from: new Date(Date.UTC(year, 0, 1)),
          days: YEAR_DAYS,
        }),
      })),
    )
    .flatMap(({ shower, peak }) => {
      const night = nightFor({
        shower,
        peak,
        place,
        civilTwilight,
        nightCentreHour,
      });

      return night !== null &&
        night.nightStart >= fromDay &&
        night.nightStart < toDay
        ? [night]
        : [];
    });
};

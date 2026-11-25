import { describe, expect, it } from 'vitest';

import {
  METEOR_SHOWERS,
  moonPhases,
  nextSeason,
  seasonsOf,
  showerNights,
  visibleEclipses,
} from '../index';
import { city, patagonia, spain, utc } from './helpers';

const phases = (from: string, to: string, extra = {}) =>
  moonPhases({
    from: utc(from),
    to: utc(to),
    timeZone: city.timeZone,
    ...extra,
  });

describe('moonPhases', () => {
  it('lists the quarters of a month with their exact time', () => {
    expect(
      phases('2026-11-01', '2026-12-01').map(
        ({ phase, at }) => `${phase} ${at.toISOString()}`,
      ),
    ).toMatchInlineSnapshot(`
      [
        "last 2026-11-01T20:28:58.794Z",
        "new 2026-11-09T07:02:42.392Z",
        "first 2026-11-17T11:48:27.140Z",
        "full 2026-11-24T14:54:04.191Z",
      ]
    `);
  });

  it('names the second full moon of a month a blue moon', () => {
    expect(
      phases('2026-05-01', '2026-06-05')
        .filter(({ phase }) => phase === 'full')
        .map(({ at, isBlue }) => [at.toISOString().slice(0, 10), isBlue]),
    ).toEqual([
      ['2026-05-01', false],
      ['2026-05-31', true],
    ]);
  });

  it('names a full moon within 360 000 km a supermoon, and lets the limit be changed', () => {
    const [december] = phases('2026-12-01', '2027-01-05').filter(
      ({ phase }) => phase === 'full',
    );
    const [november] = phases('2026-11-20', '2026-11-30').filter(
      ({ phase }) => phase === 'full',
    );

    expect(december).toMatchObject({ isSuper: true });
    expect(november).toMatchObject({ isSuper: false });
    expect(
      phases('2026-11-20', '2026-11-30', { supermoonKm: 370_000 }).find(
        ({ phase }) => phase === 'full',
      )?.isSuper,
    ).toBe(true);
  });

  it('gives no distance for the other quarters', () => {
    expect(
      phases('2026-11-01', '2026-11-20').map(({ distanceKm }) => distanceKm),
    ).toEqual([0, 0, 0]);
  });
});

describe('seasonsOf', () => {
  it('gives the equinoxes and the solstices of a year', () => {
    expect(
      seasonsOf(2026).map(({ season, at }) => `${season} ${at.toISOString()}`),
    ).toMatchInlineSnapshot(`
      [
        "marchEquinox 2026-03-20T14:45:36.044Z",
        "juneSolstice 2026-06-21T08:25:00.316Z",
        "septemberEquinox 2026-09-23T00:05:38.617Z",
        "decemberSolstice 2026-12-21T20:50:22.187Z",
      ]
    `);
  });
});

describe('nextSeason', () => {
  it('gives the first equinox or solstice after a moment', () => {
    expect(nextSeason(utc('2026-11-25'))).toEqual({
      season: 'decemberSolstice',
      at: seasonsOf(2026)[3].at,
    });
  });

  it('rolls over to the March equinox of the next year', () => {
    expect(nextSeason(utc('2026-12-22'))).toEqual({
      season: 'marchEquinox',
      at: seasonsOf(2027)[0].at,
    });
  });

  it('skips a season that is happening at that very moment', () => {
    const { at } = seasonsOf(2026)[1];

    expect(nextSeason(at).season).toBe('septemberEquinox');
  });
});

describe('meteor showers', () => {
  it('lists nine showers, each once', () => {
    expect(METEOR_SHOWERS).toHaveLength(9);
    expect(new Set(METEOR_SHOWERS.map(({ slug }) => slug)).size).toBe(9);
  });

  it('gives the peak night of a shower with the dusk, the dawn and the moon', () => {
    const [night] = showerNights({
      from: utc('2026-08-01'),
      to: utc('2026-09-01'),
      place: city,
    });

    expect(night).toMatchInlineSnapshot(`
      {
        "dawn": "2026-08-13T04:37:00",
        "dusk": "2026-08-12T20:46:00",
        "moonIllumination": 0.0004935991240846982,
        "moonIsUp": false,
        "nightStart": "2026-08-12",
        "peak": 2026-08-13T02:09:26.919Z,
        "shower": {
          "activeFrom": "07-17",
          "activeTo": "08-24",
          "degrees": 140,
          "name": "Perseids",
          "slug": "perseids",
          "zhr": 110,
        },
      }
    `);
  });

  it('puts the night before the peak, or the night of a peak in the evening', () => {
    const nights = showerNights({
      from: utc('2026-01-01'),
      to: utc('2026-12-31'),
      place: city,
    });
    const night = (slug: string) =>
      nights.find(({ shower }) => shower.slug === slug);

    expect(night('perseids')?.nightStart).toBe('2026-08-12');
    expect(night('quadrantids')?.nightStart).toBe('2026-01-03');
  });

  it('takes another centre of the night and another twilight', () => {
    const [night] = showerNights({
      from: utc('2026-08-01'),
      to: utc('2026-09-01'),
      place: city,
      nightCentreHour: 22,
      civilTwilight: -12,
    });

    expect(night?.nightStart).toBe('2026-08-12');
    expect(night?.dusk > '2026-08-12T21:00:00').toBe(true);
  });

  it('leaves out a night with no dusk or no dawn at the place, and keeps only the range', () => {
    const arctic = {
      latitude: 78,
      longitude: 15,
      elevation: 0,
      timeZone: 'Arctic/Longyearbyen',
    };

    expect(
      showerNights({
        from: utc('2026-08-01'),
        to: utc('2026-09-01'),
        place: arctic,
      }),
    ).toEqual([]);
    expect(
      showerNights({
        from: utc('2026-09-01'),
        to: utc('2026-09-30'),
        place: city,
      }),
    ).toEqual([]);
  });
});

describe('visibleEclipses', () => {
  it('keeps the eclipses seen from the place, above the horizon', () => {
    const found = visibleEclipses({
      from: utc('2026-01-01'),
      to: utc('2028-12-31'),
      place: city,
    });

    expect(
      found.lunar.map(({ kind, peak }) => `${kind} ${peak.toISOString()}`),
    ).toEqual(['partial 2028-01-12T04:13:00.859Z']);
    expect(
      found.solar.map(({ kind, peak }) => `${kind} ${peak.toISOString()}`),
    ).toEqual(['partial 2027-08-02T09:22:17.735Z']);
  });

  it('gives the phases and the altitude of a total lunar eclipse', () => {
    const [eclipse] = visibleEclipses({
      from: utc('2029-01-01'),
      to: utc('2030-01-01'),
      place: city,
    }).lunar;

    expect(eclipse).toMatchObject({
      kind: 'total',
      peak: new Date('2029-12-20T22:41:54.610Z'),
    });
    expect(eclipse?.totalMinutes).toBeGreaterThan(0);
    expect(eclipse?.moonAltitude).toBeGreaterThan(50);
  });

  it('knows a total and an annular solar eclipse, with the minutes it begins and ends', () => {
    const total = visibleEclipses({
      from: utc('2026-01-01'),
      to: utc('2027-03-01'),
      place: spain,
    }).solar;
    const annular = visibleEclipses({
      from: utc('2026-01-01'),
      to: utc('2027-03-01'),
      place: patagonia,
    }).solar;

    expect(total.map(({ kind, obscuration }) => [kind, obscuration])).toEqual([
      ['total', 1],
    ]);
    expect(
      +total[0].begin < +total[0].peak && +total[0].peak < +total[0].end,
    ).toBe(true);
    expect(annular.map(({ kind }) => kind)).toEqual(['partial']);
  });

  it('leaves out a small solar eclipse when the limit is raised', () => {
    expect(
      visibleEclipses({
        from: utc('2027-07-01'),
        to: utc('2027-09-01'),
        place: city,
        minSolarObscuration: 0.5,
      }).solar,
    ).toEqual([]);
  });

  it('leaves out an eclipse when the moon is below the horizon at its peak', () => {
    expect(
      visibleEclipses({
        from: utc('2026-02-01'),
        to: utc('2026-04-01'),
        place: city,
      }).lunar,
    ).toEqual([]);
  });
});

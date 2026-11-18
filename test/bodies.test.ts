import { describe, expect, it } from 'vitest';

import {
  bodyAltitude,
  moonDistanceKm,
  moonIllumination,
  riseSet,
  sunCrossing,
} from '../index';
import { arctic, city, utc } from './helpers';

describe('bodies', () => {
  it('gives the sunrise and the sunset of a day, rounded to the minute', () => {
    expect(
      riseSet({ body: 'sun', way: 'rise', date: '2027-12-21', place: city }),
    ).toBe('2027-12-21T07:43:00');
    expect(
      riseSet({ body: 'sun', way: 'set', date: '2027-12-21', place: city }),
    ).toBe('2027-12-21T15:25:00');
  });

  it('gives no time for a rise or a set that does not happen that day', () => {
    expect(
      riseSet({ body: 'sun', way: 'rise', date: '2026-06-21', place: arctic }),
    ).toBeNull();
    expect(
      sunCrossing({
        altitude: -18,
        way: 'set',
        date: '2026-06-21',
        place: city,
      }),
    ).toBeNull();
  });

  it('finds when the sun crosses an altitude', () => {
    expect(
      sunCrossing({
        altitude: 6,
        way: 'rise',
        date: '2027-12-21',
        place: city,
      }),
    ).toBe('2027-12-21T08:47:00');
  });

  it('gives the moonrise of a day', () => {
    expect(
      riseSet({ body: 'moon', way: 'rise', date: '2026-11-18', place: city }),
    ).toMatch(/^2026-11-18T\d{2}:\d{2}:00$/);
  });

  it('measures the moon: lit part, distance and altitude', () => {
    expect(moonIllumination(new Date('2026-11-09T07:02:00Z'))).toBeLessThan(
      0.01,
    );
    expect(moonIllumination(new Date('2026-11-24T14:54:00Z'))).toBeGreaterThan(
      0.99,
    );
    expect(Math.round(moonDistanceKm(utc('2026-11-24')) / 1000)).toBe(362);
    expect(
      bodyAltitude({
        body: 'sun',
        at: new Date('2026-06-21T10:00:00Z'),
        place: city,
      }),
    ).toBeGreaterThan(55);
    expect(
      bodyAltitude({
        body: 'sun',
        at: new Date('2026-12-21T00:00:00Z'),
        place: city,
      }),
    ).toBeLessThan(0);
  });
});

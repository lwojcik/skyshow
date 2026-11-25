import { describe, expect, it } from 'vitest';

import {
  lightOfDay,
  moonPhases,
  nextSeason,
  seasonsOf,
  showerNights,
  visibleEclipses,
} from '../index';

const place = {
  latitude: 52.2319,
  longitude: 21.0067,
  elevation: 100,
  timeZone: 'Europe/Warsaw',
};
const from = new Date('2027-01-01T00:00:00Z');
const to = new Date('2027-02-01T00:00:00Z');

describe('input checks', () => {
  it('names the expected format when a day is malformed or not on the calendar', () => {
    expect(() => lightOfDay({ date: '27-12-21', place })).toThrow(
      /YYYY-MM-DD/u,
    );
    expect(() => lightOfDay({ date: '2027-02-30', place })).toThrow(
      /YYYY-MM-DD/u,
    );
  });

  it('says which part of a place is wrong', () => {
    expect(() =>
      lightOfDay({ date: '2027-12-21', place: { ...place, latitude: 520 } }),
    ).toThrow(/latitude from -90 to 90/u);
    expect(() =>
      lightOfDay({ date: '2027-12-21', place: { ...place, longitude: 181 } }),
    ).toThrow(/longitude from -180 to 180/u);
    expect(() =>
      lightOfDay({
        date: '2027-12-21',
        place: { ...place, elevation: Number.NaN },
      }),
    ).toThrow(/elevation in metres/u);
    expect(() =>
      lightOfDay({
        date: '2027-12-21',
        place: { ...place, timeZone: 'Warsaw' },
      }),
    ).toThrow(/IANA time zone/u);
  });

  it('refuses a range that is swapped or has an invalid date', () => {
    expect(() => moonPhases({ from: to, to: from, timeZone: 'UTC' })).toThrow(
      /look swapped/u,
    );
    expect(() =>
      visibleEclipses({ from: new Date('nope'), to, place }),
    ).toThrow(/`from` to be a valid Date/u);
    expect(() => showerNights({ from: to, to: from, place })).toThrow(
      /look swapped/u,
    );
  });

  it('refuses an unknown time zone for the moon phases', () => {
    expect(() => moonPhases({ from, to, timeZone: 'Warsaw' })).toThrow(
      /IANA time zone/u,
    );
  });

  it('refuses a year that is not whole and a moment that is not a date', () => {
    expect(() => seasonsOf(2027.5)).toThrow(/whole year/u);
    expect(() => nextSeason(new Date('nope'))).toThrow(/valid Date/u);
  });

  it('still accepts a range that is a single instant', () => {
    expect(moonPhases({ from, to: from, timeZone: 'UTC' })).toEqual([]);
  });
});

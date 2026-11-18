import { describe, expect, it } from 'vitest';

import { DEFAULT_ALTITUDES, lightOfDay } from '../index';
import { arctic, city } from './helpers';

describe('lightOfDay', () => {
  it('gives the golden and the blue hour of the morning and of the evening', () => {
    expect(lightOfDay({ date: '2027-12-21', place: city })).toEqual({
      date: '2027-12-21',
      sunrise: '2027-12-21T07:43:00',
      sunset: '2027-12-21T15:25:00',
      blueMorning: '2027-12-21T06:46:00',
      goldenMorning: '2027-12-21T07:17:00',
      morningEnd: '2027-12-21T08:47:00',
      eveningStart: '2027-12-21T14:21:00',
      goldenEvening: '2027-12-21T15:51:00',
      blueEvening: '2027-12-21T16:21:00',
      astronomicalNightStart: '2027-12-21T17:32:00',
    });
  });

  it('says there is no astronomical night when the sun stays above -18 degrees', () => {
    expect(
      lightOfDay({ date: '2026-06-21', place: city })?.astronomicalNightStart,
    ).toBeNull();
  });

  it('gives nothing for a day when the sun does not rise or does not set', () => {
    expect(lightOfDay({ date: '2026-06-21', place: arctic })).toBeNull();
    expect(lightOfDay({ date: '2026-12-21', place: arctic })).toBeNull();
  });

  it('takes other altitudes for the blocks', () => {
    const wide = lightOfDay({
      date: '2027-12-21',
      place: city,
      altitudes: { ...DEFAULT_ALTITUDES, goldenTop: 10 },
    });

    expect(wide?.morningEnd).not.toBe('2027-12-21T08:47:00');
    expect(DEFAULT_ALTITUDES).toEqual({
      goldenTop: 6,
      goldenBottom: -4,
      blueBottom: -8,
      astronomicalNight: -18,
    });
  });
});

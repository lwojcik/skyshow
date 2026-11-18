import { describe, expect, it } from 'vitest';

import { sunReaches } from '@sky/sun-longitude';

import { seasonsOf } from '../index';
import { utc } from './helpers';

describe('sunReaches', () => {
  it('counts the longitude from the J2000 equinox, as the IMO prints it: 0 degrees comes about 9 hours after the equinox of date', () => {
    const reached = sunReaches({
      degrees: 0,
      from: utc('2026-03-01'),
      days: 60,
    });
    const [equinox] = seasonsOf(2026);
    const hours = (+reached - +equinox.at) / 3_600_000;

    expect(hours).toBeGreaterThan(8);
    expect(hours).toBeLessThan(10);
  });

  it('fails when the sun does not reach it in the days given', () => {
    expect(() =>
      sunReaches({ degrees: 140, from: utc('2026-01-01'), days: 30 }),
    ).toThrow(
      'The sun does not reach 140° in the 30 days from 2026-01-01T00:00:00.000Z',
    );
  });
});

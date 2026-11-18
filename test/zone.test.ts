import { describe, expect, it } from 'vitest';

import {
  addDays,
  dayOf,
  localDateTime,
  localToInstant,
  toMinute,
} from '../index';

const timeZone = 'Europe/Warsaw';

describe('zone', () => {
  it('writes an instant as the clock of the time zone, in winter and in summer', () => {
    expect(
      localDateTime({ at: new Date('2026-01-15T10:00:00Z'), timeZone }),
    ).toBe('2026-01-15T11:00:00');
    expect(
      localDateTime({ at: Date.parse('2026-07-15T10:00:00Z'), timeZone }),
    ).toBe('2026-07-15T12:00:00');
  });

  it('reads a clock of the time zone back as the instant, also on the days the clocks change', () => {
    expect(
      new Date(
        localToInstant({ local: '2026-07-15T12:00:00', timeZone }),
      ).toISOString(),
    ).toBe('2026-07-15T10:00:00.000Z');
    expect(
      new Date(
        localToInstant({ local: '2026-03-29T00:00:00', timeZone }),
      ).toISOString(),
    ).toBe('2026-03-28T23:00:00.000Z');
    expect(
      new Date(
        localToInstant({ local: '2026-03-30T00:00:00', timeZone }),
      ).toISOString(),
    ).toBe('2026-03-29T22:00:00.000Z');
    expect(
      new Date(
        localToInstant({ local: '2026-10-25T00:00:00', timeZone }),
      ).toISOString(),
    ).toBe('2026-10-24T22:00:00.000Z');
  });

  it('rounds to the nearest minute and names the day', () => {
    expect(toMinute({ at: new Date('2026-07-15T10:00:31Z'), timeZone })).toBe(
      '2026-07-15T12:01:00',
    );
    expect(toMinute({ at: new Date('2026-07-15T10:00:29Z'), timeZone })).toBe(
      '2026-07-15T12:00:00',
    );
    expect(dayOf({ at: new Date('2026-12-31T23:30:00Z'), timeZone })).toBe(
      '2027-01-01',
    );
  });

  it('adds days over month ends and leap days', () => {
    expect(addDays({ date: '2028-02-28', days: 2 })).toBe('2028-03-01');
    expect(addDays({ date: '2026-01-01', days: -1 })).toBe('2025-12-31');
  });
});

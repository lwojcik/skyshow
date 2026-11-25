import type { Place, Range } from '@sky/types';

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/u;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

const fail = (message: string): never => {
  throw new RangeError(message);
};

const isValidDate = (at: unknown): at is Date =>
  at instanceof Date && !Number.isNaN(+at);

/** Throws a `RangeError` unless `date` is a real calendar day written `YYYY-MM-DD`. */
export const assertDate = (date: string): void => {
  const isReal =
    DATE_FORMAT.test(date) &&
    !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
    new Date(`${date}T00:00:00Z`).toISOString().startsWith(date);

  if (!isReal) {
    fail(
      `Expected a day written YYYY-MM-DD (e.g. "2027-12-21"), got ${JSON.stringify(date)}`,
    );
  }
};

/** Throws a `RangeError` unless `at` is a valid `Date`. */
export const assertInstant = ({
  at,
  name,
}: {
  at: unknown;
  name: string;
}): void => {
  if (!isValidDate(at)) {
    fail(`Expected \`${name}\` to be a valid Date, got ${String(at)}`);
  }
};

/** Throws a `RangeError` unless `from` and `to` are valid and `from` is not after `to`. */
export const assertRange = ({ from, to }: Range): void => {
  assertInstant({ at: from, name: 'from' });
  assertInstant({ at: to, name: 'to' });

  if (+from > +to) {
    fail(
      `Expected \`from\` (${from.toISOString()}) to be before \`to\` (${to.toISOString()}); the two look swapped`,
    );
  }
};

/** Throws a `RangeError` unless the place has a latitude in −90…90, a longitude in −180…180, a finite elevation in metres and an IANA time zone. */
export const assertPlace = (place: Place): void => {
  const { latitude, longitude, elevation, timeZone } = place;

  if (!Number.isFinite(latitude) || Math.abs(latitude) > MAX_LATITUDE) {
    fail(`Expected a latitude from -90 to 90 degrees, got ${latitude}`);
  }

  if (!Number.isFinite(longitude) || Math.abs(longitude) > MAX_LONGITUDE) {
    fail(`Expected a longitude from -180 to 180 degrees, got ${longitude}`);
  }

  if (!Number.isFinite(elevation)) {
    fail(`Expected an elevation in metres, got ${elevation}`);
  }

  assertTimeZone(timeZone);
};

/** Throws a `RangeError` unless `timeZone` is an IANA time zone name such as `Europe/Warsaw`. */
export const assertTimeZone = (timeZone: string): void => {
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone });
  } catch {
    fail(
      `Expected an IANA time zone name such as "Europe/Warsaw", got ${JSON.stringify(timeZone)}`,
    );
  }
};

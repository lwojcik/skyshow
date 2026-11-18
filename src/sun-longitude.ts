import {
  Body,
  GeoVector,
  RotateVector,
  Rotation_EQJ_ECL,
} from 'astronomy-engine';

const HALF_TURN = 180;
const FULL_TURN = 360;
const BISECTIONS = 40;
const MS_PER_DAY = 86_400_000;

const sunLongitude = (at: Date) => {
  const ecliptic = RotateVector(
    Rotation_EQJ_ECL(),
    GeoVector(Body.Sun, at, true),
  );

  return (
    ((Math.atan2(ecliptic.y, ecliptic.x) * HALF_TURN) / Math.PI + FULL_TURN) %
    FULL_TURN
  );
};

const gapTo = ({ at, degrees }: { at: Date; degrees: number }) =>
  ((sunLongitude(at) - degrees + HALF_TURN + FULL_TURN) % FULL_TURN) -
  HALF_TURN;

const daysAfter = ({ from, days }: { from: Date; days: number }) =>
  new Date(+from + days * MS_PER_DAY);

const narrow = ({
  low,
  high,
  degrees,
  steps,
}: {
  low: Date;
  high: Date;
  degrees: number;
  steps: number;
}): Date => {
  if (steps === 0) {
    return high;
  }

  const middle = new Date((+low + +high) / 2);
  const isBefore = gapTo({ at: middle, degrees }) < 0;

  return narrow({
    low: isBefore ? middle : low,
    high: isBefore ? high : middle,
    degrees,
    steps: steps - 1,
  });
};

export const sunReaches = ({
  degrees,
  from,
  days,
}: {
  degrees: number;
  from: Date;
  days: number;
}): Date => {
  const day = Array.from({ length: days }, (_, index) => index).find(
    (index) =>
      gapTo({ at: daysAfter({ from, days: index }), degrees }) < 0 &&
      gapTo({ at: daysAfter({ from, days: index + 1 }), degrees }) >= 0,
  );

  if (day === undefined) {
    throw new RangeError(
      `The sun does not reach ${degrees}° in the ${days} days from ${from.toISOString()}`,
    );
  }

  return narrow({
    low: daysAfter({ from, days: day }),
    high: daysAfter({ from, days: day + 1 }),
    degrees,
    steps: BISECTIONS,
  });
};

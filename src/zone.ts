const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;
const ISO_DATE_LENGTH = 10;

const formats = new Map<string, Intl.DateTimeFormat>();

const formatFor = (timeZone: string) => {
  const known = formats.get(timeZone);

  if (known) {
    return known;
  }

  const made = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  // eslint-disable-next-line functional/immutable-data -- a cache of the formats made so far
  formats.set(timeZone, made);

  return made;
};

const naiveUtc = (local: string) => Date.parse(`${local}Z`);

export const localDateTime = ({
  at,
  timeZone,
}: {
  at: Date | number;
  timeZone: string;
}): string => {
  const parts = Object.fromEntries(
    formatFor(timeZone)
      .formatToParts(new Date(at))
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
};

export const localToInstant = ({
  local,
  timeZone,
}: {
  local: string;
  timeZone: string;
}): number => {
  const guess = naiveUtc(local);
  const offset = naiveUtc(localDateTime({ at: guess, timeZone })) - guess;
  const first = guess - offset;
  const secondOffset = naiveUtc(localDateTime({ at: first, timeZone })) - first;

  return guess - secondOffset;
};

export const toMinute = ({
  at,
  timeZone,
}: {
  at: Date;
  timeZone: string;
}): string =>
  localDateTime({
    at: Math.round(+at / MS_PER_MINUTE) * MS_PER_MINUTE,
    timeZone,
  });

export const addDays = ({
  date,
  days,
}: {
  date: string;
  days: number;
}): string =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, ISO_DATE_LENGTH);

export const dayOf = ({ at, timeZone }: { at: Date; timeZone: string }) =>
  toMinute({ at, timeZone }).slice(0, ISO_DATE_LENGTH);

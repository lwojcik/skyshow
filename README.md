# skyshow

[![NPM Version](https://img.shields.io/npm/v/skyshow)](https://www.npmjs.com/package/skyshow)
[![Build status](https://ci.appveyor.com/api/projects/status/m0q6cse1j55rma2f/branch/main?svg=true)](https://ci.appveyor.com/project/lwojcik/skyshow/branch/main)
[![codecov](https://codecov.io/github/lwojcik/skyshow/graph/badge.svg?token=GLo1RKfODO)](https://codecov.io/github/lwojcik/skyshow)

What the sky does over a place on a date: the golden and blue hours, the moon's phases (with supermoons and blue moons), the peaks of the meteor showers, the eclipses you can see from the place, and the equinoxes and solstices. It is a thin, checked layer over [`astronomy-engine`](https://www.npmjs.com/package/astronomy-engine).

## Install

```sh
npm install skyshow
```

## Use

A place has a latitude, a longitude, an elevation in metres and the IANA name of its time zone. The days and the clock times it gives are in that time zone, as `YYYY-MM-DD` and `YYYY-MM-DDTHH:MM:SS` (rounded to the minute). Moments are `Date` instants.

```ts
import {
  lightOfDay,
  moonPhases,
  seasonsOf,
  showerNights,
  visibleEclipses,
} from 'skyshow';

const place = {
  latitude: 52.2319,
  longitude: 21.0067,
  elevation: 100,
  timeZone: 'Europe/Warsaw',
};

lightOfDay({ date: '2027-12-21', place });
// {
//   date: '2027-12-21',
//   sunrise: '2027-12-21T07:43:00',  sunset: '2027-12-21T15:25:00',
//   blueMorning: '2027-12-21T06:46:00',  goldenMorning: '2027-12-21T07:17:00',  morningEnd: '2027-12-21T08:47:00',
//   eveningStart: '2027-12-21T14:21:00',  goldenEvening: '2027-12-21T15:51:00',  blueEvening: '2027-12-21T16:21:00',
//   astronomicalNightStart: '2027-12-21T17:32:00',
// }
```

- **`lightOfDay({ date, place, altitudes })`** gives the sunrise and sunset and the blocks of the morning and of the evening. The golden hour is the sun between −4° and +6°, the blue hour between −8° and −4° (`DEFAULT_ALTITUDES`; pass your own `altitudes`). The morning is `blueMorning` to `goldenMorning` (blue), `goldenMorning` to `morningEnd` (golden); the evening is `eveningStart` to `goldenEvening` (golden), `goldenEvening` to `blueEvening` (blue). `astronomicalNightStart` is `null` when the sun never goes below −18°. A day where one of the crossings does not exist (near the poles) gives `null`.
- **`moonPhases({ from, to, timeZone, supermoonKm })`** gives the new, first quarter, full and last quarter moons between two instants, each with `at`. A full moon has its `distanceKm`, `isSuper` (nearer than `supermoonKm`, 360 000 by default) and `isBlue` (the second full moon of a calendar month in the time zone).
- **`showerNights({ from, to, place })`** gives the peak of each of the nine meteor showers of `METEOR_SHOWERS` (the International Meteor Organization's working list, the showers with a ZHR of 10 or more) that falls in the range: the `peak` instant, the `nightStart` day of the night nearest the peak, the civil `dusk` and `dawn` of that night, the `moonIllumination` (0 to 1) at midnight and whether the moon is up (`moonIsUp`). A night with no civil twilight at the place is left out. The peaks are read from the sun's ecliptic longitude **of the J2000 equinox**, as the IMO prints it; with the longitude of date the peaks come out about 9 hours early.
- **`visibleEclipses({ from, to, place, minSolarObscuration })`** gives `{ lunar, solar }`, only the eclipses seen from the place: a lunar one that is partial or total with the moon above the horizon at the peak, a solar one that hides at least 10% (`minSolarObscuration`) with the sun above the horizon at the peak. Penumbral lunar eclipses are left out. Each has its `peak`, `obscuration` and, for a solar one, `begin` and `end`.
- **`seasonsOf(year)`** gives the March equinox, the June solstice, the September equinox and the December solstice, as instants. **`nextSeason(after)`** gives the first of them after a moment, looking into the next year when the year is over.
- **`riseSet`, `sunCrossing`, `bodyAltitude`, `moonIllumination`, `moonDistanceKm`** are the building blocks, and **`toMinute`, `localDateTime`, `localToInstant`, `dayOf`, `addDays`** convert between instants and the clock of a time zone.

## Errors

Bad input throws a `RangeError` that says what was expected: a day that is not `YYYY-MM-DD`, a latitude outside −90…90, an unknown time zone, a `from` after `to`. It never quietly returns an empty result.

## For AI agents

[`llms.txt`](llms.txt) ships in the package (`node_modules/skyshow/llms.txt`): the conventions (units, time formats, what `null` means), which function answers which question, and the pitfalls. To make the agents in your project use it, add a line to your `AGENTS.md` or `CLAUDE.md`: _For sky times (golden hour, moon phases, meteor showers, eclipses, seasons) use `skyshow`; read `node_modules/skyshow/llms.txt` first._

## Accuracy

The times are computed from the positions of the sun and the moon, for a point with no buildings or terrain, and rounded to the minute. They were compared with timeanddate.com for one date and with a second, independent computation (NOAA's algorithm) for the equinoxes and solstices, which agreed within 35 seconds. This is not an almanac of record. A new version of `astronomy-engine` can move a time by a minute, which is why it is pinned here and updated deliberately.

## Development

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

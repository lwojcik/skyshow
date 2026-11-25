/** A point on earth and the time zone its clock follows. */
export interface Place {
  /** Degrees, −90 to 90, north positive. */
  latitude: number;
  /** Degrees, −180 to 180, east positive. */
  longitude: number;
  /** Metres above sea level. */
  elevation: number;
  /** IANA time zone name, e.g. `Europe/Warsaw`. */
  timeZone: string;
}

export type Celestial = 'sun' | 'moon';

export type Way = 'rise' | 'set';

/** Sun altitudes in degrees that bound the golden hour (`goldenBottom` to `goldenTop`), the blue hour (`blueBottom` to `goldenBottom`) and astronomical night. */
export interface Altitudes {
  goldenTop: number;
  goldenBottom: number;
  blueBottom: number;
  astronomicalNight: number;
}

/** Local clock strings `YYYY-MM-DDTHH:MM:SS`. Morning runs blueMorning → goldenMorning (blue) → morningEnd (golden); evening runs eveningStart → goldenEvening (golden) → blueEvening (blue). */
export interface DayLight {
  date: string;
  sunrise: string;
  sunset: string;
  blueMorning: string;
  goldenMorning: string;
  morningEnd: string;
  eveningStart: string;
  goldenEvening: string;
  blueEvening: string;
  astronomicalNightStart: string | null;
}

export type MoonQuarter = 'new' | 'first' | 'full' | 'last';

/** One quarter of the moon. `distanceKm`, `isSuper` and `isBlue` only mean something when `phase` is `full` (`distanceKm` is 0 otherwise). */
export interface MoonPhase {
  phase: MoonQuarter;
  at: Date;
  isSuper: boolean;
  isBlue: boolean;
  distanceKm: number;
}

/** A meteor shower: `degrees` is the sun's ecliptic longitude (J2000) at the peak, `zhr` the zenithal hourly rate, `activeFrom`/`activeTo` are `MM-DD`. */
export interface MeteorShower {
  slug: string;
  name: string;
  degrees: number;
  zhr: number;
  activeFrom: string;
  activeTo: string;
}

/** A shower's peak and the night nearest to it. `nightStart` is a `YYYY-MM-DD` day; `dusk` and `dawn` are local clock strings. */
export interface ShowerNight {
  shower: MeteorShower;
  peak: Date;
  nightStart: string;
  dusk: string;
  dawn: string;
  moonIllumination: number;
  moonIsUp: boolean;
}

export type LunarKind = 'partial' | 'total';

/** A lunar eclipse seen from a place. `obscuration` is 0 to 1; the minutes are the semi-durations of the partial and total phases; `moonAltitude` is in degrees at the peak. */
export interface LunarEclipse {
  kind: LunarKind;
  peak: Date;
  obscuration: number;
  partialMinutes: number;
  totalMinutes: number;
  moonAltitude: number;
}

export type SolarKind = 'partial' | 'annular' | 'total';

/** A solar eclipse seen from a place. `obscuration` is the share of the sun's disc hidden at the peak (0 to 1); `sunAltitude` is in degrees at the peak. */
export interface SolarEclipse {
  kind: SolarKind;
  obscuration: number;
  begin: Date;
  peak: Date;
  end: Date;
  sunAltitude: number;
}

export interface VisibleEclipses {
  lunar: LunarEclipse[];
  solar: SolarEclipse[];
}

export type SeasonName =
  'marchEquinox' | 'juneSolstice' | 'septemberEquinox' | 'decemberSolstice';

/** An equinox or solstice and the instant it happens (UTC). */
export interface Season {
  season: SeasonName;
  at: Date;
}

/** A span of instants; `from` must not be after `to`. */
export interface Range {
  from: Date;
  to: Date;
}

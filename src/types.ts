export interface Place {
  latitude: number;
  longitude: number;
  elevation: number;
  timeZone: string;
}

export type Celestial = 'sun' | 'moon';

export type Way = 'rise' | 'set';

export interface Altitudes {
  goldenTop: number;
  goldenBottom: number;
  blueBottom: number;
  astronomicalNight: number;
}

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

export interface MoonPhase {
  phase: MoonQuarter;
  at: Date;
  isSuper: boolean;
  isBlue: boolean;
  distanceKm: number;
}

export interface MeteorShower {
  slug: string;
  name: string;
  degrees: number;
  zhr: number;
  activeFrom: string;
  activeTo: string;
}

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

export interface LunarEclipse {
  kind: LunarKind;
  peak: Date;
  obscuration: number;
  partialMinutes: number;
  totalMinutes: number;
  moonAltitude: number;
}

export type SolarKind = 'partial' | 'annular' | 'total';

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

export interface Season {
  season: SeasonName;
  at: Date;
}

export interface Range {
  from: Date;
  to: Date;
}

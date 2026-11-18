import type { Place } from '@sky/types';

export const city: Place = {
  latitude: 52.2319,
  longitude: 21.0067,
  elevation: 100,
  timeZone: 'Europe/Warsaw',
};

export const arctic: Place = {
  latitude: 78,
  longitude: 15,
  elevation: 0,
  timeZone: 'Arctic/Longyearbyen',
};

export const spain: Place = {
  latitude: 41.65,
  longitude: -0.89,
  elevation: 0,
  timeZone: 'Europe/Madrid',
};

export const patagonia: Place = {
  latitude: -45,
  longitude: -70,
  elevation: 0,
  timeZone: 'America/Argentina/Buenos_Aires',
};

export const utc = (text: string) => new Date(`${text}T00:00:00Z`);

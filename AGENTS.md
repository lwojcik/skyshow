# skyshow

TypeScript library: what the sky does over a place on a date, as a thin checked layer over `astronomy-engine`. Read `README.md` for the API and `llms.txt` for the conventions.

## Commands

- `npm ci`, then `npm test` (runs with `TZ=UTC`; do not run `vitest` directly), `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`.
- All of test, typecheck, lint and format:check must pass before a commit. Husky runs the hooks.
- Commits follow Conventional Commits (`npm run commit` is an interactive helper; commitlint enforces it). Releases are cut with release-it; do not bump the version by hand.

## Layout

- `index.ts` is the only entry point and the public API. Anything not re-exported there is private.
- `src/` holds one module per concern. Modules import each other through the `@sky/*` alias (`@sky/types`, `@sky/zone`, ...), not relative paths.
- `src/types.ts` holds the public types. `src/validate.ts` holds the input checks every public function calls first.
- `test/` mirrors `src/`; tests import from `../index`, not from `src`.

## Rules that surprise people

- ESLint comes from `@lwojcik/eslint-config` and is strict: no comments except JSDoc (`/** */`) on exports in `src/`, which `eslint.config.js` allows so the shipped types carry docs; no loops, no mutation, no `let`, lines of at most 80 characters. Put intent in names and small functions. Read `node_modules/@lwojcik/eslint-config/llms.txt` before fighting a rule. A disable directive is acceptable only where a rule's own message permits it.
- Functions take one object argument. Public functions validate input and throw `RangeError` with a message that says what was expected; do not let bad input reach `astronomy-engine`, where it fails obscurely or returns nothing.
- `astronomy-engine` is pinned to an exact version on purpose: an update can move a time by a minute. Bump it deliberately and re-check the tests.
- Meteor shower peaks use the sun's ecliptic longitude of the J2000 equinox. Do not change it to the longitude of date.
- Clock times are strings in the place's time zone, rounded to the minute; instants are `Date`. Keep it that way in new functions.

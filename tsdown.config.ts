import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['index.ts'],
  format: 'esm',
  dts: true,
  platform: 'node',
  target: 'node24',
  tsconfig: 'tsconfig.json',
  clean: true,
});

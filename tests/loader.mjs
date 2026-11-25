// Lets `node --test` load the app's TypeScript server code (see tests/hooks.mjs).
import { register } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

register('./hooks.mjs', import.meta.url, { data: { root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') } });

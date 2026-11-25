// Module resolve hook: maps the `@/` alias to the project root and adds the missing `.ts` to extension-less imports.
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

let root = '';
export function initialize(data) { root = data.root; }

function withExtension(file) {
  for (const f of [`${file}.ts`, `${file}.tsx`, `${file}.js`, path.join(file, 'index.ts')]) {
    if (existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  let target = null;
  if (specifier.startsWith('@/')) target = path.join(root, specifier.slice(2));
  else if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
    target = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
  }
  if (target && !(existsSync(target) && statSync(target).isFile())) {
    const found = withExtension(target);
    if (found) return next(pathToFileURL(found).href, context);
  }
  return next(specifier, context);
}

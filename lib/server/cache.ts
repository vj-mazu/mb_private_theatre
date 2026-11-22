import 'server-only';

/**
 * Small in-process cache for public, read-mostly data (catalog, settings, gallery, promos).
 * Any admin change calls `invalidateContent()`, so edits show on the website immediately.
 */
const g = globalThis as unknown as { mbCache?: Map<string, { at: number; value: Promise<unknown> }> };
const store = (g.mbCache ??= new Map());

export function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string, seconds = 300) {
  return (...args: A): Promise<R> => {
    const k = `${key}:${JSON.stringify(args)}`;
    const hit = store.get(k);
    if (hit && Date.now() - hit.at < seconds * 1000) return hit.value as Promise<R>;
    const value = fn(...args).catch((err) => { store.delete(k); throw err; });
    store.set(k, { at: Date.now(), value });
    return value;
  };
}

export function invalidateContent() {
  store.clear();
}

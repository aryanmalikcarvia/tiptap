/**
 * Share in-flight / recent requests (React StrictMode double-mount).
 */
const DEFAULT_TTL_MS = 1500

type Entry<T> = {
  promise: Promise<T>
  timer?: ReturnType<typeof setTimeout>
}

const store = new Map<string, Entry<unknown>>()

export function dedupeRequest<T>(
  key: string,
  factory: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const existing = store.get(key) as Entry<T> | undefined
  if (existing) return existing.promise

  const promise = factory().finally(() => {
    const entry = store.get(key)
    if (!entry || entry.promise !== promise) return
    entry.timer = setTimeout(() => {
      if (store.get(key)?.promise === promise) store.delete(key)
    }, ttlMs)
  })

  store.set(key, { promise })
  return promise
}

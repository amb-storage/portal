const RELOAD_KEY = 'amb:chunk-reload-at'
/** Avoid reload loops when an asset is genuinely broken rather than stale. */
const MIN_INTERVAL_MS = 30_000

/** True for the errors browsers raise when a lazily imported route chunk no longer exists. */
export function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(message)
}

/**
 * After a deploy, tabs opened earlier still reference the previous build's
 * hashed chunks, which no longer exist. Reload once to pick up the new index.html.
 */
export function reloadForNewBuild() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
    if (Date.now() - last < MIN_INTERVAL_MS) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // Storage unavailable: still reload, the interval guard is best-effort.
  }
  window.location.reload()
  return true
}

export function installChunkReload() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewBuild()) event.preventDefault()
  })
}

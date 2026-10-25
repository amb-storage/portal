type Listener = () => void

const listeners = new Set<Listener>()

/** Fired when an authenticated request returns 401 (expired or revoked session). */
export function onSessionExpired(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function emitSessionExpired() {
  listeners.forEach((listener) => listener())
}

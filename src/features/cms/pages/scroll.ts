import { useEffect } from 'react'

export const TOC_ID = 'muc-luc'

/** DOM id of a policy section card; the Policies screen links here via `#policy-<anchorKey>`. */
export const policySectionDomId = (anchorKey: string) => `policy-${anchorKey}`

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Scrolls to `location.hash` once the editor has rendered (links from the Policies screen). */
export function useScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const frame = requestAnimationFrame(() => scrollToId(id))
    return () => cancelAnimationFrame(frame)
  }, [])
}

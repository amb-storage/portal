import { useBlocker } from '@tanstack/react-router'

/**
 * Asks before leaving a page with unsaved form changes. Search-param changes
 * (e.g. switching tabs) on the same path are not blocked.
 */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
  useBlocker({
    disabled: !when,
    enableBeforeUnload: when,
    shouldBlockFn: ({ current, next }) =>
      current.pathname !== next.pathname && !window.confirm('Bạn có thay đổi chưa lưu. Rời trang và bỏ thay đổi?'),
  })
  return null
}

/** Permission keys enforced by the API's @RequirePermissions guards. */
export const PERMISSIONS = {
  catalogRead: 'catalog.read',
  catalogManage: 'catalog.manage',
  catalogPublish: 'catalog.publish',
  mediaRead: 'media.read',
  mediaManage: 'media.manage',
  pageRead: 'page.read',
  pageEdit: 'page.edit',
  pagePublish: 'page.publish',
  pagePreview: 'page.preview',
  storyRead: 'story.read',
  storyManage: 'story.manage',
  navigationRead: 'navigation.read',
  navigationManage: 'navigation.manage',
  settingsRead: 'settings.read',
  settingsManage: 'settings.manage',
  ordersRead: 'orders.read',
  ordersManage: 'orders.manage',
  auditRead: 'audit.read',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

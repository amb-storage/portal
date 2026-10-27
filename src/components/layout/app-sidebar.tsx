import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight, Store } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { NAV_ENTRIES, NAV_FOOTER_LINK, type NavEntry, type NavItem } from './nav-items'
import { NavUser } from './nav-user'

const OPEN_KEY = 'amb-portal:sidebar-open-sections'

/** Same rule as Link's default active matching: the route or anything under it ('/' only exact). */
const isActivePath = (pathname: string, to: string) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`))

function readOpen(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(OPEN_KEY) ?? '{}') as Record<string, boolean>
  } catch {
    return {}
  }
}

function NavLink({ item }: { item: NavItem }) {
  return (
    <SidebarMenuItem>
      <Link to={item.to} activeOptions={{ exact: item.to === '/' }}>
        {({ isActive }) => (
          <SidebarMenuButton isActive={isActive} tooltip={item.title}>
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        )}
      </Link>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const { can } = usePermissions()
  const { state, isMobile } = useSidebar()
  const pathname = useRouterState({ select: (router) => router.location.pathname })
  // Sections the Admin opened or closed by hand; the one holding the current page is always open.
  const [open, setOpen] = useState<Record<string, boolean>>(readOpen)
  const iconOnly = state === 'collapsed' && !isMobile

  const allowed = (item: NavItem) => !item.permission || can(item.permission)
  const entries = NAV_ENTRIES.flatMap((entry): NavEntry[] => {
    if (entry.kind === 'link') return allowed(entry) ? [entry] : []
    const items = entry.items.filter(allowed)
    return items.length ? [{ ...entry, items }] : []
  })

  const toggle = (id: string, next: boolean) =>
    setOpen((current) => {
      const updated = { ...current, [id]: next }
      localStorage.setItem(OPEN_KEY, JSON.stringify(updated))
      return updated
    })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-semibold">AMB:STORAGE</span>
                  <span className="text-xs text-sidebar-foreground/70">Trang quản trị</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {entries.map((entry) => {
              if (entry.kind === 'link') return <NavLink key={entry.to} item={entry} />
              const containsActive = entry.items.some((item) => isActivePath(pathname, item.to))
              // Icon-only sidebar has no room for sub-menus: show the section's pages as plain icons.
              if (iconOnly) return entry.items.map((item) => <NavLink key={item.to} item={item} />)
              const isOpen = containsActive || (open[entry.id] ?? false)
              return (
                <Collapsible.Root key={entry.id} asChild open={isOpen} onOpenChange={(next) => toggle(entry.id, next)}>
                  <SidebarMenuItem>
                    <Collapsible.Trigger asChild>
                      <SidebarMenuButton tooltip={entry.title} className={containsActive ? 'font-medium' : undefined}>
                        <entry.icon />
                        <span>{entry.title}</span>
                        <ChevronRight className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <SidebarMenuSub>
                        {entry.items.map((item) => (
                          <SidebarMenuSubItem key={item.to}>
                            <SidebarMenuSubButton asChild isActive={isActivePath(pathname, item.to)}>
                              <Link to={item.to}>
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </Collapsible.Content>
                  </SidebarMenuItem>
                </Collapsible.Root>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <NavLink item={NAV_FOOTER_LINK} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

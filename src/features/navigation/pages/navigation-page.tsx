import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/common/page-header'
import { QueryState } from '@/components/common/query-state'
import { menuQuery } from '../queries'
import { MenuEditor } from '../components/menu-editor'
import { useNavigationPage } from '../hooks/use-navigation-page'
import { MENU_KEYS } from '../types'

export function NavigationPage() {
  const { menuKey, setMenuKey, canManage } = useNavigationPage()
  const menu = useQuery(menuQuery(menuKey))

  return (
    <>
      <PageHeader
        title="Menu điều hướng"
        description="Menu đầu trang (HEADER) và chân trang (FOOTER). Bấm Lưu để thay toàn bộ menu."
      />
      <Tabs value={menuKey} onValueChange={setMenuKey}>
        <TabsList>
          {MENU_KEYS.map((key) => (
            <TabsTrigger key={key} value={key}>{key}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <QueryState query={menu}>
        {(data) => <MenuEditor key={`${data.key}:${data.revision}`} menu={data} canManage={canManage} />}
      </QueryState>
    </>
  )
}

import { PageHeader } from '@/components/common/page-header'
import { QueryState } from '@/components/common/query-state'
import { SettingsForm } from '../components/settings-form'
import { useSettingsPage } from '../hooks/use-settings-page'

export function SettingsPage() {
  const { settings, canManage } = useSettingsPage()
  return (
    <>
      <PageHeader title="Cài đặt cửa hàng" description="Thông tin chung, thuế, chân trang và SEO mặc định." />
      <QueryState query={settings}>
        {(data) => <SettingsForm key={data.revision} settings={data} canManage={canManage} />}
      </QueryState>
    </>
  )
}

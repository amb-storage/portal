import { useMemo } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { ConfirmButton } from '@/components/common/confirm-button'
import { ErrorAlert } from '@/components/common/query-state'
import { DataTable } from '@/components/data-table/data-table'
import { ProfileCard } from '../components/profile-card'
import { buildSessionColumns } from '../components/sessions-columns'
import { useAccountPage } from '../hooks/use-account-page'

export function AccountPage() {
  const { me, sessions, revoke, logoutAll } = useAccountPage()
  const revokeSession = revoke.mutate
  const columns = useMemo(() => buildSessionColumns((id) => revokeSession(id)), [revokeSession])

  return (
    <>
      <PageHeader
        title="Tài khoản"
        description="Thông tin cá nhân, quyền và các phiên đăng nhập."
        actions={
          <ConfirmButton
            variant="destructive"
            title="Đăng xuất khỏi mọi thiết bị?"
            description="Tất cả các phiên, kể cả phiên này, sẽ bị đăng xuất."
            onConfirm={() => logoutAll.mutate()}
          >
            Đăng xuất mọi thiết bị
          </ConfirmButton>
        }
      />
      <ProfileCard me={me} />
      <ErrorAlert error={sessions.error} />
      <DataTable
        columns={columns}
        data={sessions.data?.items}
        isLoading={sessions.isPending}
        getRowId={(row) => row.id}
      />
    </>
  )
}

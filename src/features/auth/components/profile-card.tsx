import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'
import type { MeResponse } from '../types'

export function ProfileCard({ me }: { me: MeResponse }) {
  const { admin, session } = me
  return (
    <Card>
      <CardHeader>
        <CardTitle>{admin.displayName}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <Row label="Email">{admin.email}</Row>
        <Row label="Vai trò">
          <div className="flex flex-wrap gap-1">
            {admin.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </Row>
        <Row label="Phiên hết hạn">{formatDateTime(session.expiresAt)}</Row>
        <Row label="Quyền">
          <div className="flex flex-wrap gap-1">
            {admin.permissions.map((permission) => (
              <Badge key={permission} variant="outline">
                {permission}
              </Badge>
            ))}
          </div>
        </Row>
      </CardContent>
    </Card>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-2">
      <span className="text-muted-foreground">{label}</span>
      <div>{children}</div>
    </div>
  )
}

import { Archive, Mail, MailOpen, Reply } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/common/page-header'
import { StatusBadge } from '@/components/common/status-badge'
import { formatDateTime } from '@/lib/format'
import { MockNotice } from '../components/mock-notice'
import { useInquiryDetailPage } from '../hooks/use-inquiry-detail-page'
import { INQUIRY_CATEGORY_LABELS } from '../types'

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  )
}

export function InquiryDetailPage() {
  const { inquiry, note, setNote, noteDirty, saveNote, setStatus, isPending, replyHref } = useInquiryDetailPage()
  const archived = inquiry.status === 'ARCHIVED'

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {inquiry.subject} <StatusBadge status={inquiry.status} />
          </span>
        }
        description={`${inquiry.name} · ${formatDateTime(inquiry.createdAt)}`}
        actions={
          <>
            <Button asChild>
              <a href={replyHref}>
                <Reply /> Trả lời qua email
              </a>
            </Button>
            {inquiry.status !== 'REPLIED' && !archived ? (
              <Button variant="outline" disabled={isPending} onClick={() => setStatus('REPLIED')}>
                <MailOpen /> Đánh dấu đã trả lời
              </Button>
            ) : null}
            {archived ? (
              <Button variant="outline" disabled={isPending} onClick={() => setStatus('READ')}>
                Bỏ lưu trữ
              </Button>
            ) : (
              <>
                <Button variant="outline" disabled={isPending} onClick={() => setStatus('NEW')}>
                  <Mail /> Chưa đọc
                </Button>
                <Button variant="outline" disabled={isPending} onClick={() => setStatus('ARCHIVED')}>
                  <Archive /> Lưu trữ
                </Button>
              </>
            )}
          </>
        }
      />
      <MockNotice />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tin nhắn</CardTitle>
              <CardDescription>Gửi lúc {formatDateTime(inquiry.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 whitespace-pre-wrap">{inquiry.message}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú nội bộ</CardTitle>
              <CardDescription>Chỉ Admin thấy, khách không nhận được.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Ví dụ: đã gọi điện, hẹn gửi ảnh qua Instagram…" />
              <Button className="justify-self-end" variant="outline" disabled={!noteDirty || isPending} onClick={saveNote}>
                Lưu ghi chú
              </Button>
            </CardContent>
          </Card>
        </div>
        <Card className="content-start">
          <CardHeader>
            <CardTitle>Người gửi</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3">
              <InfoRow label="Tên">{inquiry.name}</InfoRow>
              <InfoRow label="Email">
                <a href={replyHref} className="text-primary underline-offset-4 hover:underline">
                  {inquiry.email}
                </a>
              </InfoRow>
              <InfoRow label="Chủ đề">
                <Badge variant="outline">{INQUIRY_CATEGORY_LABELS[inquiry.category]}</Badge>
              </InfoRow>
              <InfoRow label="Ngôn ngữ website">{inquiry.locale === 'ja' ? 'Tiếng Nhật' : 'Tiếng Anh'}</InfoRow>
              {inquiry.orderNumber ? <InfoRow label="Mã đơn hàng">{inquiry.orderNumber}</InfoRow> : null}
              <InfoRow label="Trả lời lúc">{formatDateTime(inquiry.repliedAt)}</InfoRow>
              <InfoRow label="Cập nhật">{formatDateTime(inquiry.updatedAt)}</InfoRow>
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

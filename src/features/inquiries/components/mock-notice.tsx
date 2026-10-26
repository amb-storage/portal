import { FlaskConical } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { INQUIRIES_ARE_MOCK } from '../inquiry.service'

export function MockNotice({ onReset }: { onReset?: () => void }) {
  if (!INQUIRIES_ARE_MOCK) return null
  return (
    <Alert>
      <FlaskConical />
      <AlertTitle>Bản mẫu: chưa nối API</AlertTitle>
      <AlertDescription>
        <span>
          Đây là dữ liệu mẫu chỉ lưu trên trình duyệt này. Khi backend có API liên hệ (docs/CONTACT_API_PROPOSAL.md), tin nhắn từ form お問い合わせ trên website sẽ hiện ở đây.
          {onReset ? (
            <>
              {' '}
              <button type="button" className="underline underline-offset-4" onClick={onReset}>
                Khôi phục dữ liệu mẫu
              </button>
            </>
          ) : null}
        </span>
      </AlertDescription>
    </Alert>
  )
}

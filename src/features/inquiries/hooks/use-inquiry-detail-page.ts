import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { describeError } from '@/lib/api/errors'
import { inquiryService } from '../inquiry.service'
import { inquiryDetailQuery, inquiryKeys } from '../queries'
import type { InquiryStatus, InquiryUpdate } from '../types'

const route = getRouteApi('/_app/inquiries/$inquiryId')

const STATUS_TOASTS: Record<InquiryStatus, string> = {
  NEW: 'Đã đánh dấu chưa đọc',
  READ: 'Đã đánh dấu đã đọc',
  REPLIED: 'Đã đánh dấu đã trả lời',
  ARCHIVED: 'Đã lưu trữ',
}

export function useInquiryDetailPage() {
  const { inquiryId } = route.useParams()
  const { data: inquiry } = useSuspenseQuery(inquiryDetailQuery(inquiryId))
  const queryClient = useQueryClient()
  const [note, setNote] = useState(inquiry.adminNote ?? '')

  const update = useMutation({
    mutationFn: (body: InquiryUpdate) => inquiryService.update(inquiryId, body),
    onSuccess: async (updated) => {
      queryClient.setQueryData(inquiryKeys.detail(inquiryId), updated)
      await queryClient.invalidateQueries({ queryKey: [...inquiryKeys.all, 'list'] })
    },
    onError: (error) => toast.error(describeError(error)),
  })
  const markRead = update.mutate

  // Opening a new message marks it read, like an email inbox.
  useEffect(() => {
    if (inquiry.status === 'NEW') markRead({ status: 'READ' })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opened message
  }, [inquiry.id])

  const setStatus = (status: InquiryStatus) => update.mutate({ status }, { onSuccess: () => toast.success(STATUS_TOASTS[status]) })
  const saveNote = () => update.mutate({ adminNote: note.trim() || null }, { onSuccess: () => toast.success('Đã lưu ghi chú') })

  const replySubject = inquiry.locale === 'ja' ? `Re: ${inquiry.subject}【Amb:STORAGE】` : `Re: ${inquiry.subject} [Amb:STORAGE]`
  const replyHref = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(replySubject)}`

  return { inquiry, note, setNote, noteDirty: note.trim() !== (inquiry.adminNote ?? ''), saveNote, setStatus, isPending: update.isPending, replyHref }
}

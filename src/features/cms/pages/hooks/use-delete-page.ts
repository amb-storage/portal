import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { describeError } from '@/lib/api/errors'
import { cmsPageService } from '../cms-page.service'
import { cmsPageKeys } from '../queries'

/** "Delete" is the API's archive: the page leaves the website and cannot be restored. */
export function useDeletePage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cmsPageService.archive,
    onSuccess: async () => {
      toast.success('Đã xoá trang')
      await queryClient.invalidateQueries({ queryKey: cmsPageKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form-hook'
import { pageListQuery } from '@/features/cms/pages/queries'
import { describeError } from '@/lib/api/errors'
import { navigationService } from '../navigation.service'
import { navigationKeys } from '../queries'
import { toMenuPayload, toMenuValues } from '../menu-values'
import type { MenuFormValues, NavigationMenu } from '../types'

export function useMenuEditor(menu: NavigationMenu) {
  const queryClient = useQueryClient()
  const pages = useQuery(pageListQuery({ page: 1, limit: 100, status: 'ACTIVE' }))
  const pageOptions = (pages.data?.items ?? []).map((page) => ({ value: page.id, label: `${page.slug} (${page.type})` }))

  const save = useMutation({
    mutationFn: (values: MenuFormValues) =>
      navigationService.replace(menu.key, { expectedRevision: menu.revision, items: toMenuPayload(values) }),
    onSuccess: (updated) => {
      toast.success(`Đã lưu menu ${menu.key}`)
      queryClient.setQueryData(navigationKeys.menu(menu.key), updated)
    },
    onError: (error) => toast.error(describeError(error)),
  })

  const form = useAppForm({
    defaultValues: toMenuValues(menu),
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })

  return { form, pageOptions }
}

export type MenuForm = ReturnType<typeof useMenuEditor>['form']

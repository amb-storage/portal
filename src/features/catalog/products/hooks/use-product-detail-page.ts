import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { describeError } from '@/lib/api/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { productService } from '../product.service'
import { publishChecklist, type ChecklistTarget } from '../publish-checklist'
import { productDetailQuery, productKeys } from '../queries'
import type { Product } from '../types'

const route = getRouteApi('/_app/catalog/products/$productId')

type Lifecycle = 'publish' | 'unpublish'

const DONE: Record<Lifecycle, string> = { publish: 'Đã đăng bán sản phẩm', unpublish: 'Đã ngừng bán sản phẩm' }

export function useProductDetailPage() {
  const { productId } = route.useParams()
  const { tab } = route.useSearch()
  const navigate = route.useNavigate()
  const { data: product, dataUpdatedAt } = useSuspenseQuery(productDetailQuery(productId))
  const { can } = usePermissions()
  const queryClient = useQueryClient()
  const checklist = publishChecklist(product)

  const setTab = (next: string) => navigate({ search: { tab: next as typeof tab }, replace: true })

  const lifecycle = useMutation({
    mutationFn: (action: Lifecycle) => productService[action](productId),
    onSuccess: async ({ product: updated }, action) => {
      toast.success(DONE[action])
      queryClient.setQueryData<Product>(productKeys.detail(productId), updated)
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => toast.error(describeError(error)),
  })

  /** Jump to the tab (and field) that fixes a checklist item. */
  const goTo = async (target: ChecklistTarget) => {
    await setTab(target.tab)
    if (target.tab !== 'general') return
    requestAnimationFrame(() => {
      const element = document.getElementById(target.field)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element?.focus({ preventScroll: true })
    })
  }

  return {
    product,
    // The detail response has no updatedAt; re-key editors on each fetch instead.
    version: dataUpdatedAt,
    tab,
    setTab,
    goTo,
    checklist,
    ready: checklist.every((item) => item.done),
    lifecycle,
    canManage: can(PERMISSIONS.catalogManage) && product.status !== 'ARCHIVED',
    canPublish: can(PERMISSIONS.catalogPublish) && product.status !== 'ARCHIVED',
  }
}

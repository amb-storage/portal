import { PublishChecklistCard } from '@/components/common/publish-checklist-card'
import { StatusBadge } from '@/components/common/status-badge'
import { PageHeader } from '@/components/common/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AliasesTab } from '../components/aliases-tab'
import { MediaTab } from '../components/media-tab'
import { ProductActions } from '../components/product-actions'
import { ProductGeneralTab } from '../components/product-general-tab'
import { StockCard } from '../components/stock-card'
import { useProductDetailPage } from '../hooks/use-product-detail-page'

export function ProductDetailPage() {
  const { product, version, tab, setTab, goTo, checklist, ready, lifecycle, canManage, canPublish } = useProductDetailPage()

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {product.nameEn || product.nameJa || 'Sản phẩm chưa đặt tên'} <StatusBadge status={product.status} />
          </span>
        }
        description={product.slug ? <code>{product.slug}</code> : 'Chưa có slug'}
        actions={
          <ProductActions
            product={product}
            canPublish={canPublish}
            ready={ready}
            isPending={lifecycle.isPending}
            onAction={(action) => lifecycle.mutate(action)}
          />
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <Tabs value={tab} onValueChange={setTab} className="min-w-0">
          <TabsList>
            <TabsTrigger value="general">Thông tin</TabsTrigger>
            <TabsTrigger value="media">Ảnh ({product.media.length})</TabsTrigger>
            <TabsTrigger value="aliases">Alias</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="pt-4">
            <ProductGeneralTab key={version} product={product} canManage={canManage} />
          </TabsContent>
          <TabsContent value="media" className="pt-4">
            <MediaTab key={version} product={product} canManage={canManage} />
          </TabsContent>
          <TabsContent value="aliases" className="pt-4">
            <AliasesTab productId={product.id} canManage={canManage} />
          </TabsContent>
        </Tabs>
        <aside className="grid gap-6 lg:sticky lg:top-44">
          {product.status === 'DRAFT' ? <PublishChecklistCard items={checklist} onGo={(item) => goTo(item.target)} /> : null}
          <StockCard product={product} canManage={canManage} />
        </aside>
      </div>
    </>
  )
}

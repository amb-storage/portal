import { PageHeader } from '@/components/common/page-header'
import { ProductForm } from '../components/product-form'
import { useProductCreatePage } from '../hooks/use-product-create-page'

export function ProductCreatePage() {
  const { form } = useProductCreatePage()
  return (
    <>
      <PageHeader title="Thêm sản phẩm" description="Sản phẩm mới ở trạng thái Nháp. Sau khi tạo, thêm ảnh rồi đăng bán." />
      <ProductForm form={form} submitLabel="Tạo sản phẩm" />
    </>
  )
}

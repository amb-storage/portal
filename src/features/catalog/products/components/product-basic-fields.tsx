import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { withForm } from '@/components/form/form-hook'
import { useQuery } from '@tanstack/react-query'
import { useCategoryOptions } from '@/features/catalog/categories/hooks/use-category-options'
import { storyListQuery } from '@/features/cms/stories/queries'
import { storyTitle } from '@/features/cms/stories/types'
import { toFormValues } from '../form-values'

export const ProductBasicFields = withForm({
  defaultValues: toFormValues(),
  props: { slugLocked: false, isEdit: false },
  render: function Render({ form, slugLocked, isEdit }) {
    const categories = useCategoryOptions()
    const stories = useQuery(storyListQuery({ page: 1, limit: 100 }))
    const storyOptions = (stories.data?.items ?? []).map((story) => ({
      value: story.id,
      label: story.status === 'PUBLISHED' ? storyTitle(story) : `${storyTitle(story)} (chưa xuất bản)`,
    }))
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Có thể lưu nháp khi chưa điền đủ. Danh sách bên phải cho biết còn thiếu gì để đăng bán.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <form.AppField name="slug">
              {(field) => (
                <field.TextField
                  label="Slug (đường dẫn)"
                  disabled={slugLocked}
                  description={
                    slugLocked
                      ? 'Sản phẩm đang bán nên không đổi được slug; hãy thêm alias.'
                      : 'Tự chuẩn hoá, vd. "MA-1 Jacket" → "ma-1-jacket".'
                  }
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="nameJa">{(field) => <field.TextField label="Tên (Nhật)" />}</form.AppField>
          <form.AppField name="nameEn">{(field) => <field.TextField label="Tên (Anh)" />}</form.AppField>
          <form.AppField name="price">{(field) => <field.NumberField label="Giá (JPY)" min={1} />}</form.AppField>
          <form.AppField name="size">{(field) => <field.TextField label="Size" />}</form.AppField>
          {isEdit ? null : (
            <form.AppField name="quantity">
              {(field) => (
                <field.NumberField label="Số lượng ban đầu" min={0} description="Sau này chỉnh ở ô Tồn kho." />
              )}
            </form.AppField>
          )}
          <div id="categoryIds">
            <form.AppField name="categoryIds">
              {(field) => <field.MultiSelectField label="Danh mục" options={categories.options} placeholder="Chọn danh mục…" />}
            </form.AppField>
          </div>
          <form.AppField name="miliTalkId">
            {(field) => (
              <field.SelectField
                label="Bài Mili Talks liên quan"
                description="Hiện ở trang sản phẩm trên website (chỉ khi bài đã xuất bản)."
                options={storyOptions}
                allowEmpty
                placeholder={stories.isPending ? 'Đang tải…' : 'Không gắn bài'}
              />
            )}
          </form.AppField>
          <form.AppField name="descriptionJa">{(field) => <field.TextareaField label="Mô tả (Nhật)" rows={4} />}</form.AppField>
          <form.AppField name="descriptionEn">{(field) => <field.TextareaField label="Mô tả (Anh)" rows={4} />}</form.AppField>
          <form.AppField name="conditionJa">{(field) => <field.TextareaField label="Tình trạng (Nhật)" rows={3} />}</form.AppField>
          <form.AppField name="conditionEn">{(field) => <field.TextareaField label="Tình trạng (Anh)" rows={3} />}</form.AppField>
        </CardContent>
      </Card>
    )
  },
})

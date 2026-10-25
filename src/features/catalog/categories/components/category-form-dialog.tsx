import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCategoryForm } from '../hooks/use-category-form'
import type { Category } from '../types'

/** Mount only while open so the form re-initializes for each category. */
export function CategoryFormDialog({ category, onClose }: { category?: Category; onClose: () => void }) {
  const { form, isEdit } = useCategoryForm(category, onClose)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="slug">{(field) => <field.TextField label="Slug (đường dẫn)" />}</form.AppField>
          <form.AppField name="nameJa">{(field) => <field.TextField label="Tên (Nhật)" />}</form.AppField>
          <form.AppField name="nameEn">{(field) => <field.TextField label="Tên (Anh)" />}</form.AppField>
          <form.AppField name="descriptionJa">{(field) => <field.TextareaField label="Mô tả (Nhật)" rows={3} />}</form.AppField>
          <form.AppField name="descriptionEn">{(field) => <field.TextareaField label="Mô tả (Anh)" rows={3} />}</form.AppField>
          <form.AppField name="position">{(field) => <field.NumberField label="Thứ tự hiển thị" min={0} />}</form.AppField>
          <DialogFooter>
            <form.AppForm>
              <form.SubmitButton>{isEdit ? 'Lưu thay đổi' : 'Tạo'}</form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

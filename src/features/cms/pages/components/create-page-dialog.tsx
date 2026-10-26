import { statusLabel } from '@/lib/labels'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreatePageForm } from '../hooks/use-create-page-form'
import { PAGE_TYPES, type PageType } from '../types'

const TYPE_TITLES: Partial<Record<PageType, string>> = { POLICY: 'Thêm trang chính sách', ABOUT: 'Tạo trang Giới thiệu' }

export function CreatePageDialog({ onClose, lockedType }: { onClose: () => void; lockedType?: PageType }) {
  const form = useCreatePageForm(lockedType)
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{(lockedType && TYPE_TITLES[lockedType]) ?? 'Thêm trang'}</DialogTitle>
          <DialogDescription>Tạo trang mới kèm một bản nháp trống.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="slug">
            {(field) => <field.TextField label="Slug (đường dẫn)" placeholder={lockedType === 'POLICY' ? 'privacy-policy' : 'about'} />}
          </form.AppField>
          {lockedType ? null : (
            <form.AppField name="type">
              {(field) => <field.SelectField label="Loại trang" options={PAGE_TYPES.map((type) => ({ value: type, label: statusLabel(type) }))} />}
            </form.AppField>
          )}
          <DialogFooter>
            <form.AppForm>
              <form.SubmitButton>Tạo trang</form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMediaAltForm } from '../hooks/use-media-alt-form'
import type { MediaAsset } from '../types'

export function MediaAltDialog({ asset, onClose }: { asset: MediaAsset; onClose: () => void }) {
  const form = useMediaAltForm(asset, onClose)
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mô tả ảnh (alt)</DialogTitle>
          <DialogDescription>{asset.originalFilename}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="altJa">{(field) => <field.TextareaField label="Alt (Nhật)" rows={2} />}</form.AppField>
          <form.AppField name="altEn">{(field) => <field.TextareaField label="Alt (Anh)" rows={2} />}</form.AppField>
          <DialogFooter>
            <form.AppForm>
              <form.SubmitButton requireDirty>Lưu</form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateStoryForm } from '../hooks/use-create-story-form'

export function CreateStoryDialog({ onClose }: { onClose: () => void }) {
  const form = useCreateStoryForm()
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm bài viết</DialogTitle>
          <DialogDescription>Sau khi tạo, bạn sẽ soạn nội dung và xuất bản ở trang chỉnh sửa.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="slug">{(field) => <field.TextField label="Slug (đường dẫn)" placeholder="vintage-care" />}</form.AppField>
          <DialogFooter>
            <form.AppForm>
              <form.SubmitButton>Tạo bài viết</form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

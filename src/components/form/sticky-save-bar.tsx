import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useFormContext } from './form-context'
import { UnsavedChangesGuard } from './unsaved-changes-guard'

/** Save bar pinned to the bottom of the viewport; render inside `form.AppForm`. */
export function StickySaveBar({ children }: { children: ReactNode }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => [state.isDirty, state.isSubmitting] as const}>
      {([isDirty, isSubmitting]) => (
        <>
          <UnsavedChangesGuard when={isDirty && !isSubmitting} />
          <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
            <span className="mr-auto text-sm text-muted-foreground">
              {isDirty ? 'Có thay đổi chưa lưu' : 'Chưa có thay đổi'}
            </span>
            {isDirty ? (
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => form.reset()}>
                Hoàn tác
              </Button>
            ) : null}
            {children}
          </div>
        </>
      )}
    </form.Subscribe>
  )
}

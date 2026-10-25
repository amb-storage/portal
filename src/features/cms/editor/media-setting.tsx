import { useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaThumb } from '@/components/common/media-thumb'
import { MediaPickerDialog } from '@/features/catalog/products/components/media-picker-dialog'

interface MediaSettingProps {
  value: string[]
  multiple: boolean
  onChange: (ids: string[]) => void
  readOnly?: boolean
}

/** Picks READY media from the library; single-media settings keep only the first pick. */
export function MediaSetting({ value, multiple, onChange, readOnly }: MediaSettingProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map((id) => (
          <div key={id} className="relative">
            <MediaThumb id={id} status="READY" className="size-24" />
            {readOnly ? null : (
              <button
                type="button"
                aria-label="Bỏ ảnh"
                onClick={() => onChange(value.filter((other) => other !== id))}
                className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
        {readOnly || (!multiple && value.length > 0) ? null : (
          <Button type="button" variant="outline" className="size-24 flex-col gap-1 border-dashed text-xs" onClick={() => setOpen(true)}>
            <ImagePlus /> {multiple ? 'Thêm ảnh' : 'Chọn ảnh'}
          </Button>
        )}
      </div>
      {!multiple && value.length > 0 && !readOnly ? (
        <Button type="button" variant="link" size="sm" className="h-auto w-fit p-0" onClick={() => setOpen(true)}>
          Đổi ảnh khác
        </Button>
      ) : null}
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        excludeIds={multiple ? value : []}
        onPick={(assets) => onChange(multiple ? [...value, ...assets.map((asset) => asset.id)].slice(0, 24) : assets.slice(0, 1).map((asset) => asset.id))}
      />
    </div>
  )
}

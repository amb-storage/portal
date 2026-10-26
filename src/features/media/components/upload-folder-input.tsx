import { useId } from 'react'
import { Folder } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface UploadFolderInputProps {
  value: string
  onChange: (value: string) => void
  folders: string[]
  disabled?: boolean
}

/** Optional upload folder: pick an existing one or type a new path (max 5 levels). */
export function UploadFolderInput({ value, onChange, folders, disabled }: UploadFolderInputProps) {
  const listId = useId()
  return (
    <div className="relative w-56">
      <Folder className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        list={listId}
        disabled={disabled}
        placeholder="Thư mục (tuỳ chọn)"
        aria-label="Thư mục tải lên"
        className="pl-8"
      />
      <datalist id={listId}>
        {folders.map((folder) => (
          <option key={folder} value={folder} />
        ))}
      </datalist>
    </div>
  )
}

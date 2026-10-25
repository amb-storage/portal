import { useRef } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SUPPORTED_MIME_TYPES } from '../types'

interface UploadButtonProps {
  isUploading: boolean
  onFiles: (files: File[]) => void
}

export function UploadButton({ isUploading, onFiles }: UploadButtonProps) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept={SUPPORTED_MIME_TYPES.join(',')}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          event.target.value = ''
          if (files.length > 0) onFiles(files)
        }}
      />
      <Button disabled={isUploading} onClick={() => input.current?.click()}>
        {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
        Tải ảnh lên
      </Button>
    </>
  )
}

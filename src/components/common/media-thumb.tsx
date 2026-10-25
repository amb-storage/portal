import { useState } from 'react'
import { ImageOff, Loader2 } from 'lucide-react'
import { mediaUrl } from '@/lib/api/config'
import { cn } from '@/lib/utils'

interface MediaThumbProps {
  id: string
  status: string
  alt?: string | null
  className?: string
  /** `contain` for previews where the whole image must be visible. */
  fit?: 'cover' | 'contain'
}

/** Only READY media is served publicly; other states show a placeholder. */
export function MediaThumb({ id, status, alt, className, fit = 'cover' }: MediaThumbProps) {
  const [failed, setFailed] = useState(false)
  const placeholder = status !== 'READY' || failed

  return (
    <div className={cn('flex items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground', className)}>
      {placeholder ? (
        status === 'PENDING' ? <Loader2 className="size-5 animate-spin" /> : <ImageOff className="size-5" />
      ) : (
        <img
          src={mediaUrl(id)}
          alt={alt ?? ''}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={cn('size-full', fit === 'cover' ? 'object-cover' : 'object-contain')}
        />
      )}
    </div>
  )
}

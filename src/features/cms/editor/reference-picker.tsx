import { useQueries, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { productDetailQuery, productListQuery } from '@/features/catalog/products/queries'
import { storyListQuery } from '@/features/cms/stories/queries'
import { storyService } from '@/features/cms/stories/story.service'

interface Option {
  id: string
  label: string
  hint?: string
}

interface ReferencePickerProps {
  kind: 'product' | 'story'
  value: string[]
  multiple: boolean
  onChange: (ids: string[]) => void
  readOnly?: boolean
}

/** Search-and-pick for products or stories, so editors never paste IDs. */
export function ReferencePicker({ kind, value, multiple, onChange, readOnly }: ReferencePickerProps) {
  const [q, setQ] = useState('')
  const term = q.trim() || undefined
  const products = useQuery({ ...productListQuery({ page: 1, limit: 8, q: term }), enabled: kind === 'product' && !readOnly })
  const stories = useQuery({ ...storyListQuery({ page: 1, limit: 8, q: term }), enabled: kind === 'story' && !readOnly })
  const selected = useSelectedLabels(kind, value)

  const results: Option[] =
    kind === 'product'
      ? (products.data?.items ?? []).map((item) => ({ id: item.id, label: item.name_en || item.name_ja || 'Chưa đặt tên', hint: item.slug ?? undefined }))
      : (stories.data?.items ?? []).map((item) => ({ id: item.id, label: item.published?.titleEn ?? item.draft?.titleEn ?? item.slug, hint: item.slug }))

  const pick = (id: string) => onChange(multiple ? [...value.filter((other) => other !== id), id] : [id])

  return (
    <div className="grid gap-2">
      {value.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((id, index) => (
            <li key={id} className="flex items-center gap-1 rounded-full border bg-accent px-2.5 py-1 text-xs text-accent-foreground">
              {selected[index] ?? '…'}
              {readOnly ? null : (
                <button type="button" aria-label="Bỏ chọn" onClick={() => onChange(value.filter((other) => other !== id))}>
                  <X className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {readOnly || (!multiple && value.length) ? null : (
        <div className="grid gap-1 rounded-md border p-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder={kind === 'product' ? 'Tìm sản phẩm…' : 'Tìm bài viết…'} className="pl-8" />
          </div>
          <ul className="grid max-h-48 overflow-y-auto">
            {results.filter((option) => !value.includes(option.id)).map((option) => (
              <li key={option.id}>
                <button type="button" onClick={() => pick(option.id)} className="flex w-full items-baseline justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted">
                  <span className="truncate">{option.label}</span>
                  {option.hint ? <code className="shrink-0 text-xs text-muted-foreground">{option.hint}</code> : null}
                </button>
              </li>
            ))}
            {results.length === 0 ? <li className="px-2 py-1.5 text-sm text-muted-foreground">Không tìm thấy.</li> : null}
          </ul>
        </div>
      )}
    </div>
  )
}

/** Resolves display names for already-selected IDs (cached per ID). */
function useSelectedLabels(kind: 'product' | 'story', ids: string[]) {
  const results = useQueries({
    queries: ids.map((id) =>
      kind === 'product'
        ? { ...productDetailQuery(id), select: (product: { nameEn: string | null; nameJa: string | null; slug: string | null }) => product.nameEn || product.nameJa || product.slug || id }
        : { queryKey: ['cms', 'stories', 'detail', id], queryFn: () => storyService.get(id), select: (story: Awaited<ReturnType<typeof storyService.get>>) => story.published?.titleEn ?? story.draft?.titleEn ?? story.slug },
    ),
  })
  return results.map((result) => (result.isError ? 'Không tìm thấy' : (result.data as string | undefined)))
}

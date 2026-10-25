import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategoryOptions } from '@/features/catalog/categories/hooks/use-category-options'
import { ReferencePicker } from './reference-picker'

type ProductSource = { type: string; productIds?: string[]; categoryId?: string; collectionId?: string; tagId?: string }
type TalkSource = { type: string; talkIds?: string[] }

const PRODUCT_SOURCES = [
  { value: 'NEWEST', label: 'Sản phẩm mới nhất' },
  { value: 'MANUAL_PRODUCTS', label: 'Tự chọn sản phẩm' },
  { value: 'CATEGORY', label: 'Theo danh mục' },
]
const TALK_SOURCES = [
  { value: 'NEWEST', label: 'Bài viết mới nhất' },
  { value: 'MANUAL_MILI_TALKS', label: 'Tự chọn bài viết' },
]

function TypeSelect({ value, options, onChange, disabled }: { value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full sm:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** PRODUCT_GRID / PRODUCT_CAROUSEL source; each type keeps only the field the API allows for it. */
export function ProductSourceSetting({ value, onChange, readOnly }: { value: ProductSource; onChange: (value: ProductSource) => void; readOnly?: boolean }) {
  const categories = useCategoryOptions()
  // COLLECTION / TAG sources predate the Product-centric catalog; keep them editable as raw IDs.
  const legacy = value.type === 'COLLECTION' || value.type === 'TAG'
  const options = legacy ? [...PRODUCT_SOURCES, { value: value.type, label: value.type === 'COLLECTION' ? 'Bộ sưu tập (cũ)' : 'Tag (cũ)' }] : PRODUCT_SOURCES

  const setType = (type: string) => {
    if (type === 'MANUAL_PRODUCTS') onChange({ type, productIds: [] })
    else onChange({ type })
  }

  return (
    <div className="grid gap-2">
      <TypeSelect value={value.type} options={options} onChange={setType} disabled={readOnly} />
      {value.type === 'MANUAL_PRODUCTS' ? (
        <ReferencePicker kind="product" multiple value={value.productIds ?? []} onChange={(productIds) => onChange({ type: value.type, productIds })} readOnly={readOnly} />
      ) : null}
      {value.type === 'CATEGORY' ? (
        <Select value={value.categoryId ?? ''} onValueChange={(categoryId) => onChange({ type: value.type, categoryId })} disabled={readOnly}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Chọn danh mục…" /></SelectTrigger>
          <SelectContent>
            {categories.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {legacy ? (
        <Input
          value={(value.type === 'COLLECTION' ? value.collectionId : value.tagId) ?? ''}
          onChange={(event) => onChange({ type: value.type, [value.type === 'COLLECTION' ? 'collectionId' : 'tagId']: event.target.value.trim() })}
          placeholder="ID"
          disabled={readOnly}
        />
      ) : null}
    </div>
  )
}

export function TalkSourceSetting({ value, onChange, readOnly }: { value: TalkSource; onChange: (value: TalkSource) => void; readOnly?: boolean }) {
  return (
    <div className="grid gap-2">
      <TypeSelect
        value={value.type}
        options={TALK_SOURCES}
        onChange={(type) => onChange(type === 'MANUAL_MILI_TALKS' ? { type, talkIds: [] } : { type })}
        disabled={readOnly}
      />
      {value.type === 'MANUAL_MILI_TALKS' ? (
        <ReferencePicker kind="story" multiple value={value.talkIds ?? []} onChange={(talkIds) => onChange({ type: value.type, talkIds })} readOnly={readOnly} />
      ) : null}
    </div>
  )
}

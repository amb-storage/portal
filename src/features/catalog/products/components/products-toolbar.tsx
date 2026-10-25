import { FilterSelect, ListToolbar, SearchInput } from '@/components/common/list-toolbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SelectOption } from '@/components/form/select-field'
import type { ProductSearch } from '../search'
import { PRODUCT_SORTS, PRODUCT_STATUSES } from '../types'

interface ProductsToolbarProps {
  search: ProductSearch
  setSearch: (patch: Partial<ProductSearch>) => void
  categoryOptions: SelectOption[]
}

const ALL = '__all__'

const SORT_LABELS: Record<string, string> = {
  createdAt: 'Ngày tạo',
  updatedAt: 'Ngày cập nhật',
  publishedAt: 'Ngày đăng bán',
  name: 'Tên',
}

function sortLabel(value: string) {
  const [sort, direction] = value.split(':')
  const arrow = sort === 'name' ? (direction === 'asc' ? 'A → Z' : 'Z → A') : direction === 'asc' ? 'cũ nhất' : 'mới nhất'
  return `${SORT_LABELS[sort] ?? sort} (${arrow})`
}

function OptionFilter({ value, onChange, options, placeholder }: {
  value?: string
  onChange: (value?: string) => void
  options: SelectOption[]
  placeholder: string
}) {
  return (
    <Select value={value ?? ALL} onValueChange={(next) => onChange(next === ALL ? undefined : next)}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ProductsToolbar({ search, setSearch, categoryOptions }: ProductsToolbarProps) {
  return (
    <ListToolbar>
      <SearchInput value={search.q} onChange={(q) => setSearch({ q })} placeholder="Tìm theo tên hoặc slug…" />
      <FilterSelect
        value={search.status}
        onChange={(status) => setSearch({ status: status as ProductSearch['status'] })}
        options={PRODUCT_STATUSES}
        placeholder="Mọi trạng thái"
      />
      <OptionFilter value={search.categoryId} onChange={(categoryId) => setSearch({ categoryId })} options={categoryOptions} placeholder="Mọi danh mục" />
      <FilterSelect
        value={`${search.sort}:${search.direction}`}
        onChange={(value) => {
          const [sort, direction] = (value ?? 'createdAt:desc').split(':') as [ProductSearch['sort'], ProductSearch['direction']]
          setSearch({ sort, direction })
        }}
        options={PRODUCT_SORTS.flatMap((sort) => [`${sort}:desc`, `${sort}:asc`])}
        labelOf={sortLabel}
        placeholder="Sắp xếp"
      />
    </ListToolbar>
  )
}

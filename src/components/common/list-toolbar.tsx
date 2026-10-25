import { useEffect, useState, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { statusLabel } from '@/lib/labels'

const ALL = '__all__'

interface FilterSelectProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  options: readonly string[]
  placeholder: string
  /** Defaults to the shared enum labels. */
  labelOf?: (value: string) => string
}

export function FilterSelect({ value, onChange, options, placeholder, labelOf = statusLabel }: FilterSelectProps) {
  return (
    <Select value={value ?? ALL} onValueChange={(next) => onChange(next === ALL ? undefined : next)}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labelOf(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface SearchInputProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  placeholder?: string
}

/** Debounced search box bound to a route search param. */
export function SearchInput({ value, onChange, placeholder = 'Tìm kiếm…' }: SearchInputProps) {
  const [draft, setDraft] = useState(value ?? '')
  const [synced, setSynced] = useState(value)
  // Adopt external changes (back/forward, cleared filters) during render.
  if (synced !== value) {
    setSynced(value)
    setDraft(value ?? '')
  }
  useEffect(() => {
    if (draft === (value ?? '')) return
    const timer = setTimeout(() => onChange(draft.trim() || undefined), 350)
    return () => clearTimeout(timer)
  }, [draft, value, onChange])

  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} className="pl-8" />
    </div>
  )
}

export function ListToolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>
}

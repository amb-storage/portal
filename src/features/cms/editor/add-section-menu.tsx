import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { sectionLabel } from './labels'

interface Choice {
  type: string
  label: string
  category?: string
}

interface AddMenuProps {
  choices: Choice[]
  onAdd: (type: string) => void
  children?: ReactNode
  disabledTypes?: string[]
}

const CATEGORY_LABELS: Record<string, string> = { CONTENT: 'Nội dung', COMMERCE: 'Bán hàng' }

/** Dropdown of section (or block) types allowed in this position. */
export function AddMenu({ choices, onAdd, children, disabledTypes = [] }: AddMenuProps) {
  const groups = [...new Set(choices.map((choice) => choice.category ?? ''))]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ?? (
          <Button type="button" variant="outline" className="w-full border-dashed">
            <Plus /> Thêm khối
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 w-64 overflow-y-auto">
        {groups.map((group, index) => (
          <div key={group || index}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            {group ? <DropdownMenuLabel className="text-xs text-muted-foreground">{CATEGORY_LABELS[group] ?? group}</DropdownMenuLabel> : null}
            {choices
              .filter((choice) => (choice.category ?? '') === group)
              .map((choice) => (
                <DropdownMenuItem key={choice.type} disabled={disabledTypes.includes(choice.type)} onSelect={() => onAdd(choice.type)}>
                  {sectionLabel(choice.type, choice.label)}
                </DropdownMenuItem>
              ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

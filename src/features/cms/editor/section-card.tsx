import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ConfirmButton } from '@/components/common/confirm-button'
import { cn } from '@/lib/utils'
import { AddMenu } from './add-section-menu'
import { newBlock } from './document'
import { sectionLabel } from './labels'
import { SettingField } from './setting-field'
import type { BlockDef, CmsBlock, CmsSection, SectionDef } from './types'

interface SectionCardProps {
  section: CmsSection
  definition: SectionDef | undefined
  blockDefs: BlockDef[]
  index: number
  count: number
  issueCount: number
  readOnly?: boolean
  onChange: (section: CmsSection) => void
  onMove: (delta: number) => void
  onRemove: () => void
}

export function SectionCard({ section, definition, blockDefs, index, count, issueCount, readOnly, onChange, onMove, onRemove }: SectionCardProps) {
  const [open, setOpen] = useState(true)
  const setSetting = (key: string, value: unknown) => {
    const settings = { ...section.settings }
    if (value === undefined) delete settings[key]
    else settings[key] = value
    onChange({ ...section, settings })
  }
  const setBlocks = (blocks: CmsBlock[]) => onChange({ ...section, blocks })
  const allowedBlocks = blockDefs.filter((block) => definition?.allowedBlocks.includes(block.type))

  return (
    <Card className={cn('gap-0 py-0', !section.enabled && 'opacity-60')}>
      <CardHeader className="flex flex-row items-center gap-2 border-b px-4 py-2">
        <button type="button" onClick={() => setOpen(!open)} className="flex flex-1 items-center gap-2 text-left" aria-expanded={open}>
          <ChevronDown className={cn('size-4 transition', !open && '-rotate-90')} />
          <span className="text-xs text-muted-foreground tabular-nums">{index + 1}</span>
          <span className="font-medium">{sectionLabel(section.type, definition?.label)}</span>
          {issueCount ? <span className="rounded-full bg-red-100 px-2 text-xs text-red-800 dark:bg-red-400/15 dark:text-red-300">{issueCount} cần sửa</span> : null}
        </button>
        {readOnly ? null : (
          <div className="flex items-center gap-1">
            <label className="mr-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={section.enabled} onCheckedChange={(enabled) => onChange({ ...section, enabled })} /> Hiển thị
            </label>
            <Button type="button" size="icon" variant="ghost" aria-label="Lên" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp /></Button>
            <Button type="button" size="icon" variant="ghost" aria-label="Xuống" disabled={index === count - 1} onClick={() => onMove(1)}><ArrowDown /></Button>
            <ConfirmButton type="button" size="icon" variant="ghost" aria-label="Xoá khối" title="Xoá khối này?" description="Nội dung trong khối sẽ mất sau khi lưu." confirmLabel="Xoá" onConfirm={onRemove}>
              <Trash2 />
            </ConfirmButton>
          </div>
        )}
      </CardHeader>
      {open ? (
        <CardContent className="grid gap-4 p-4">
          {definition ? (
            definition.settings.map((setting) => (
              <SettingField key={setting.key} setting={setting} value={section.settings[setting.key]} onChange={(value) => setSetting(setting.key, value)} editorKey={section.id} readOnly={readOnly} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Loại khối này chưa được hỗ trợ trong trình soạn. Dùng chế độ JSON để sửa.</p>
          )}
          {definition && definition.maxBlocks > 0 ? (
            <div className="grid gap-3 rounded-md border border-dashed p-3">
              <p className="text-xs font-medium text-muted-foreground">Phần tử con ({section.blocks.length}/{definition.maxBlocks})</p>
              {section.blocks.map((block, blockIndex) => {
                const blockDef = blockDefs.find((candidate) => candidate.type === block.type)
                return (
                  <div key={block.id} className="grid gap-3 rounded-md bg-muted/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-sm font-medium">{sectionLabel(block.type, blockDef?.label)}</span>
                      {readOnly ? null : (
                        <Button type="button" size="icon" variant="ghost" aria-label="Xoá phần tử" onClick={() => setBlocks(section.blocks.filter((other) => other.id !== block.id))}>
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                    {blockDef?.settings.map((setting) => (
                      <SettingField
                        key={setting.key}
                        setting={setting}
                        value={block.settings[setting.key]}
                        editorKey={block.id}
                        readOnly={readOnly}
                        onChange={(value) => {
                          const settings = { ...block.settings }
                          if (value === undefined) delete settings[setting.key]
                          else settings[setting.key] = value
                          setBlocks(section.blocks.map((other, otherIndex) => (otherIndex === blockIndex ? { ...block, settings } : other)))
                        }}
                      />
                    ))}
                  </div>
                )
              })}
              {readOnly || section.blocks.length >= definition.maxBlocks ? null : (
                <AddMenu choices={allowedBlocks} onAdd={(type) => {
                  const blockDef = allowedBlocks.find((candidate) => candidate.type === type)
                  if (blockDef) setBlocks([...section.blocks, newBlock(blockDef)])
                }}>
                  <Button type="button" variant="ghost" size="sm" className="w-fit"><Plus /> Thêm phần tử</Button>
                </AddMenu>
              )}
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  )
}

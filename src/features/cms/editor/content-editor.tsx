import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Braces, LayoutList } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { QueryState } from '@/components/common/query-state'
import { sectionRegistryQuery } from '@/features/cms/pages/queries'
import type { SectionRegistry } from '@/features/cms/pages/types'
import { cn } from '@/lib/utils'
import { AddMenu } from './add-section-menu'
import { documentIssues, newSection, parseDocumentV1, sectionsForProfile } from './document'
import { SectionCard } from './section-card'
import type { CmsDocumentV1, CmsSection, ContentProfile } from './types'

interface ContentEditorProps {
  /** Pretty-printed JSON document (the form's source of truth). */
  value: string
  onChange: (value: string) => void
  profile: ContentProfile
  registry?: SectionRegistry
  readOnly?: boolean
}

export function ContentEditor(props: ContentEditorProps) {
  const registryQuery = useQuery({ ...sectionRegistryQuery, enabled: !props.registry })
  if (props.registry) return <Editor {...props} registry={props.registry} />
  return <QueryState query={registryQuery}>{(data) => <Editor {...props} registry={data} />}</QueryState>
}

function Editor({ value, onChange, profile, readOnly, registry }: ContentEditorProps & { registry: SectionRegistry }) {
  const doc = useMemo(() => parseDocumentV1(value), [value])
  const [mode, setMode] = useState<'visual' | 'json'>(doc ? 'visual' : 'json')
  const allowed = sectionsForProfile(registry.sections, profile)
  const issues = doc ? documentIssues(doc, registry.sections, registry.blocks) : []

  const write = (next: CmsDocumentV1) => onChange(JSON.stringify(next, null, 2))
  const setSections = (sections: CmsSection[]) => doc && write({ ...doc, sections })
  const hasTalkHeader = doc?.sections.some((section) => section.type === 'TALK_HEADER')

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-sm">
          <ModeButton active={mode === 'visual'} disabled={!doc} onClick={() => setMode('visual')}><LayoutList /> Trình soạn</ModeButton>
          <ModeButton active={mode === 'json'} onClick={() => setMode('json')}><Braces /> JSON</ModeButton>
        </div>
        {!doc ? <span className="text-xs text-muted-foreground">Loại trang này dùng cấu trúc riêng, hiện chỉ sửa được bằng JSON.</span> : null}
      </div>

      {issues.length ? (
        <div className="grid gap-1 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
          <p className="flex items-center gap-2 font-medium"><AlertTriangle className="size-4" /> Cần sửa {issues.length} chỗ trước khi lưu</p>
          <ul className="list-disc pl-6">
            {issues.slice(0, 5).map((issue) => <li key={issue.message}>{issue.message}</li>)}
            {issues.length > 5 ? <li>… và {issues.length - 5} chỗ khác</li> : null}
          </ul>
        </div>
      ) : null}

      {mode === 'json' || !doc ? (
        <Textarea rows={24} className="font-mono text-xs" value={value} onChange={(event) => onChange(event.target.value)} disabled={readOnly} spellCheck={false} />
      ) : (
        <div className="grid gap-3">
          {doc.sections.length === 0 ? (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Chưa có nội dung. Bấm “Thêm khối” để bắt đầu, ví dụ Đoạn văn hoặc Ảnh.</p>
          ) : null}
          {doc.sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              definition={registry.sections.find((definition) => definition.type === section.type)}
              blockDefs={registry.blocks}
              index={index}
              count={doc.sections.length}
              issueCount={issues.filter((issue) => issue.sectionId === section.id).length}
              readOnly={readOnly}
              onChange={(next) => setSections(doc.sections.map((other) => (other.id === section.id ? next : other)))}
              onRemove={() => setSections(doc.sections.filter((other) => other.id !== section.id))}
              onMove={(delta) => {
                const next = [...doc.sections]
                ;[next[index], next[index + delta]] = [next[index + delta], next[index]]
                setSections(next)
              }}
            />
          ))}
          {readOnly ? null : (
            <AddMenu
              choices={allowed}
              disabledTypes={hasTalkHeader ? ['TALK_HEADER'] : []}
              onAdd={(type) => {
                const definition = allowed.find((candidate) => candidate.type === type)
                if (definition) setSections([...doc.sections, newSection(definition)])
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

function ModeButton({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn('flex items-center gap-1.5 rounded-md px-3 py-1 text-muted-foreground disabled:opacity-40 [&_svg]:size-4', active && 'bg-background text-foreground shadow-xs')}
    >
      {children}
    </button>
  )
}

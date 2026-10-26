import { useQuery } from '@tanstack/react-query'
import { usePageProfile } from '../hooks/use-page-profile'
import { QueryState } from '@/components/common/query-state'
import { fixedContentQuery } from '../queries'
import { useDraftEditor } from '../hooks/use-draft-editor'
import { useFixedContentEditor } from '../hooks/use-fixed-content-editor'
import type { CmsPage, FixedContent, PageVersion } from '../types'
import { DraftForm } from './draft-form'
import { FixedContentForm } from './fixed-content-form'
import { useFixedForm } from '../hooks/use-fixed-form'
import { isAboutTemplateDraft, useAboutForm } from '../hooks/use-about-form'
import { AboutContentForm } from './about-form'

function PageDraftEditor({ page, draft, readOnly }: { page: CmsPage; draft: PageVersion; readOnly: boolean }) {
  const form = useDraftEditor(page.id, draft)
  const profile = usePageProfile(page)
  return <DraftForm form={form} readOnly={readOnly} profile={profile} revisionLabel={`Nháp v${draft.version} · lần sửa ${draft.revision}`} />
}

/** Canonical fixed content gets the simple bilingual form; legacy slot documents keep the JSON editor. */
function SimpleFixedEditor({ page, fixed, readOnly }: { page: CmsPage; fixed: FixedContent; readOnly: boolean }) {
  const form = useFixedForm(page.id, fixed)
  return <FixedContentForm form={form} isPolicy={fixed.pageType === 'POLICY'} readOnly={readOnly} />
}

/** Legacy schemaVersion 2 slot documents (ABOUT/POLICY) are still edited as JSON. */
function JsonFixedEditor({ page, fixed, readOnly }: { page: CmsPage; fixed: FixedContent; readOnly: boolean }) {
  const form = useFixedContentEditor(page.id, fixed)
  const profile = fixed.pageType === 'ABOUT' ? 'FIXED_ABOUT' : 'FIXED_POLICY'
  return <DraftForm form={form} readOnly={readOnly} profile={profile} revisionLabel={`Nội dung cố định ${fixed.pageType} · lần sửa ${fixed.expectedRevision}`} />
}

/** About uses the structured section layout of the website (schemaVersion 2). */
function AboutEditor({ page, fixed, readOnly }: { page: CmsPage; fixed: FixedContent; readOnly: boolean }) {
  const form = useAboutForm(page.id, fixed)
  return <AboutContentForm form={form} readOnly={readOnly} fromTemplate={isAboutTemplateDraft(fixed)} />
}

function FixedContentEditor(props: { page: CmsPage; fixed: FixedContent; readOnly: boolean }) {
  if (props.fixed.pageType === 'ABOUT') return <AboutEditor {...props} />
  return props.fixed.content ? <JsonFixedEditor {...props} /> : <SimpleFixedEditor {...props} />
}

interface DraftTabProps {
  page: CmsPage
  draft: { data: PageVersion | undefined; error: unknown; isPending: boolean }
  readOnly: boolean
}

export function DraftTab({ page, draft, readOnly }: DraftTabProps) {
  const isFixed = page.type === 'ABOUT' || page.type === 'POLICY'
  const fixed = useQuery({ ...fixedContentQuery(page.id), enabled: isFixed && page.status === 'ACTIVE' })

  if (page.status !== 'ACTIVE') return <p className="text-sm text-muted-foreground">Trang đã lưu trữ không còn bản nháp để sửa.</p>
  if (isFixed) {
    return (
      <QueryState query={fixed}>
        {(data) => <FixedContentEditor key={`${data.draftVersionId}:${data.expectedRevision}`} page={page} fixed={data} readOnly={readOnly} />}
      </QueryState>
    )
  }
  return (
    <QueryState query={draft}>
      {(data) => <PageDraftEditor key={`${data.id}:${data.revision}`} page={page} draft={data} readOnly={readOnly} />}
    </QueryState>
  )
}

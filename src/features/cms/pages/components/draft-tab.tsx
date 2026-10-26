import { useQuery } from '@tanstack/react-query'
import { usePageProfile } from '../hooks/use-page-profile'
import { QueryState } from '@/components/common/query-state'
import { fixedContentQuery } from '../queries'
import { useDraftEditor } from '../hooks/use-draft-editor'
import { isAboutTemplateDraft, useAboutForm } from '../hooks/use-about-form'
import { isPolicyUnstructured, useFixedPolicyForm } from '../hooks/use-policy-form'
import { policyTemplateFor } from '../policy-template'
import type { CmsPage, FixedContent, PageVersion } from '../types'
import { AboutContentForm } from './about-form'
import { DraftForm } from './draft-form'
import { PolicyContentForm } from './policy-form'

function PageDraftEditor({ page, draft, readOnly }: { page: CmsPage; draft: PageVersion; readOnly: boolean }) {
  const form = useDraftEditor(page.id, draft)
  const profile = usePageProfile(page)
  return <DraftForm form={form} readOnly={readOnly} profile={profile} revisionLabel={`Nháp v${draft.version} · lần sửa ${draft.revision}`} />
}

/** About uses the structured section layout of the website (schemaVersion 2). */
function AboutEditor({ page, fixed, readOnly }: { page: CmsPage; fixed: FixedContent; readOnly: boolean }) {
  const form = useAboutForm(page.id, fixed)
  return <AboutContentForm form={form} readOnly={readOnly} fromTemplate={isAboutTemplateDraft(fixed)} />
}

/** Policies use structured POLICY_SECTIONs (schemaVersion 2), as rendered on the website's /policy page. */
function PolicyEditor({ page, fixed, readOnly }: { page: CmsPage; fixed: FixedContent; readOnly: boolean }) {
  const form = useFixedPolicyForm(page, fixed)
  return <PolicyContentForm form={form} readOnly={readOnly} template={policyTemplateFor(page.slug)} unstructured={isPolicyUnstructured(fixed)} />
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
        {(data) => {
          const key = `${data.draftVersionId}:${data.expectedRevision}`
          return data.pageType === 'ABOUT' ? (
            <AboutEditor key={key} page={page} fixed={data} readOnly={readOnly} />
          ) : (
            <PolicyEditor key={key} page={page} fixed={data} readOnly={readOnly} />
          )
        }}
      </QueryState>
    )
  }
  return (
    <QueryState query={draft}>
      {(data) => <PageDraftEditor key={`${data.id}:${data.revision}`} page={page} draft={data} readOnly={readOnly} />}
    </QueryState>
  )
}

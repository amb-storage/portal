import { formatDateTime } from '@/lib/format'
import { useSettingsForm } from '../hooks/use-settings-form'
import type { StoreSettings } from '../types'
import { GeneralSection, SeoSection, TaxFooterSection } from './settings-sections'
import { SocialLinksSection } from './social-links-section'

/** Key by revision so the form resets after a successful save. */
export function SettingsForm({ settings, canManage }: { settings: StoreSettings; canManage: boolean }) {
  const form = useSettingsForm(settings)
  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <fieldset disabled={!canManage} className="grid gap-6">
        <GeneralSection form={form} />
        <TaxFooterSection form={form} />
        <SeoSection form={form} />
        <SocialLinksSection form={form} />
      </fieldset>
      <p className="text-sm text-muted-foreground">Cập nhật lần cuối {formatDateTime(settings.updatedAt)}</p>
      {canManage ? (
        <form.AppForm>
          <form.StickySaveBar>
            <form.SubmitButton requireDirty>Lưu cài đặt</form.SubmitButton>
          </form.StickySaveBar>
        </form.AppForm>
      ) : null}
    </form>
  )
}

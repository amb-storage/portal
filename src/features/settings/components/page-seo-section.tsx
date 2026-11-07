import { Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { withForm } from '@/components/form/form-hook'
import type { SettingsFormValues } from '../form-values'
import { PAGE_SEO_KEYS, type PageSeoKey } from '../types'

const PAGES: Record<PageSeoKey, { label: string; path: string }> = {
  shop: { label: 'Trang Shop', path: '/shop' },
  contact: { label: 'Trang Liên hệ', path: '/contact' },
  customerVoice: { label: 'Trang Customer Voice', path: '/customer-voice' },
}

/** Titles for website pages that are not CMS pages; empty fields keep the website's default. */
export const PageSeoSection = withForm({
  defaultValues: {} as SettingsFormValues,
  props: { supported: true },
  render: function Render({ form, supported }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEO các trang cố định</CardTitle>
          <CardDescription>
            Tiêu đề hiện trên tab trình duyệt và Google, mô tả hiện dưới tiêu đề khi tìm kiếm hoặc chia sẻ link. Để trống thì website dùng tiêu đề mặc định. Trống tiếng Anh thì
            trang tiếng Anh dùng bản tiếng Nhật.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {supported ? (
            PAGE_SEO_KEYS.map((key) => (
              <div key={key} className="grid gap-3">
                <h3 className="text-sm font-semibold">
                  {PAGES[key].label} <span className="font-normal text-muted-foreground">{PAGES[key].path}</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <form.AppField name={`pageSeo.${key}.titleJa`}>{(field) => <field.TextField label="Tiêu đề (Nhật)" />}</form.AppField>
                  <form.AppField name={`pageSeo.${key}.titleEn`}>{(field) => <field.TextField label="Tiêu đề (Anh)" />}</form.AppField>
                  <form.AppField name={`pageSeo.${key}.descriptionJa`}>{(field) => <field.TextareaField label="Mô tả (Nhật)" rows={2} />}</form.AppField>
                  <form.AppField name={`pageSeo.${key}.descriptionEn`}>{(field) => <field.TextareaField label="Mô tả (Anh)" rows={2} />}</form.AppField>
                </div>
              </div>
            ))
          ) : (
            <Alert>
              <Info />
              <AlertDescription>Bản API hiện tại chưa hỗ trợ mục này. Cập nhật API (migration 0041) rồi tải lại trang.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  },
})

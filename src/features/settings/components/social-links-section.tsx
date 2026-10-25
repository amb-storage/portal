import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { withForm } from '@/components/form/form-hook'
import type { SettingsFormValues } from '../form-values'

export const SocialLinksSection = withForm({
  defaultValues: {} as SettingsFormValues,
  render: function Render({ form }) {
    return (
      <form.AppField name="socialLinks" mode="array">
        {(links) => (
          <Card>
            <CardHeader>
              <CardTitle>Mạng xã hội</CardTitle>
              <CardDescription>Hiển thị theo thứ tự; chỉ nhận link HTTPS.</CardDescription>
              <CardAction>
                <Button type="button" variant="outline" size="sm" onClick={() => links.pushValue({ platform: '', label: '', href: 'https://' })}>
                  <Plus /> Thêm link
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-3">
              {links.state.value.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có link nào.</p> : null}
              {links.state.value.map((_, index) => (
                <div key={index} className="grid items-end gap-2 md:grid-cols-[160px_1fr_2fr_auto]">
                  <form.AppField name={`socialLinks[${index}].platform`}>{(field) => <field.TextField label="Nền tảng" />}</form.AppField>
                  <form.AppField name={`socialLinks[${index}].label`}>{(field) => <field.TextField label="Tên hiển thị" />}</form.AppField>
                  <form.AppField name={`socialLinks[${index}].href`}>{(field) => <field.TextField label="URL" />}</form.AppField>
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="ghost" aria-label="Lên" disabled={index === 0} onClick={() => links.moveValue(index, index - 1)}>
                      <ArrowUp />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" aria-label="Xuống" disabled={index === links.state.value.length - 1} onClick={() => links.moveValue(index, index + 1)}>
                      <ArrowDown />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" aria-label="Xoá" onClick={() => links.removeValue(index)}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </form.AppField>
    )
  },
})

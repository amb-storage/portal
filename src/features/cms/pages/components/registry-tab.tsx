import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QueryState } from '@/components/common/query-state'
import { sectionRegistryQuery } from '../queries'

/** Read-only reference of section types and their settings for the JSON editor. */
export function RegistryTab() {
  const registry = useQuery(sectionRegistryQuery)
  return (
    <QueryState query={registry}>
      {(data) => (
        <div className="grid gap-4 md:grid-cols-2">
          {data.sections.map((section) => (
            <Card key={section.type} className="gap-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.label} <code className="text-xs text-muted-foreground">{section.type}</code>
                </CardTitle>
                <CardDescription className="flex flex-wrap gap-1">
                  {section.allowedProfiles.map((profile) => (
                    <Badge key={profile} variant="outline">{profile}</Badge>
                  ))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-1 text-sm">
                  {section.settings.map((setting) => (
                    <li key={setting.key}>
                      <code>{setting.key}</code>
                      <span className="text-muted-foreground"> · {setting.kind}{setting.required ? ' · bắt buộc' : ''}</span>
                      {setting.values ? <span className="text-muted-foreground"> · {setting.values.join(' | ')}</span> : null}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </QueryState>
  )
}

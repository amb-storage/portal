import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form-hook'
import { describeError } from '@/lib/api/errors'
import { storeSettingsService } from '../store-settings.service'
import { settingsKeys } from '../queries'
import { settingsSchema, toSettingsPayload, toSettingsValues, type SettingsFormValues } from '../form-values'
import type { StoreSettings } from '../types'

export function useSettingsForm(settings: StoreSettings) {
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: (values: SettingsFormValues) => storeSettingsService.update(toSettingsPayload(values, settings.revision, settings.invoiceFields !== undefined, settings.contactPhone !== undefined)),
    onSuccess: (updated) => {
      toast.success('Đã lưu cài đặt')
      queryClient.setQueryData(settingsKeys.all, updated)
    },
    onError: (error) => toast.error(describeError(error)),
  })

  return useAppForm({
    defaultValues: toSettingsValues(settings),
    validators: { onSubmit: settingsSchema },
    onSubmit: ({ value }) => save.mutateAsync(value).catch(() => undefined),
  })
}

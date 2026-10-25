import { queryOptions } from '@tanstack/react-query'
import { storeSettingsService } from './store-settings.service'

export const settingsKeys = { all: ['store-settings'] as const }

export const settingsQuery = queryOptions({ queryKey: settingsKeys.all, queryFn: storeSettingsService.get })

import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './form-context'
import { MultiSelectField } from './multi-select-field'
import { NumberField } from './number-field'
import { SelectField } from './select-field'
import { StickySaveBar } from './sticky-save-bar'
import { SubmitButton } from './submit-button'
import { SwitchField } from './switch-field'
import { TextField } from './text-field'
import { TextareaField } from './textarea-field'

/**
 * App-wide TanStack Form hook. Use `form.AppField` + `field.TextField` etc.
 * so every input shares label, error and a11y wiring.
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, NumberField, TextareaField, SelectField, SwitchField, MultiSelectField },
  formComponents: { SubmitButton, StickySaveBar },
})

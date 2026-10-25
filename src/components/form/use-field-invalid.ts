import { useFieldContext } from './form-context'

/** True when the field has errors the user should see (touched or after submit). */
export function useFieldInvalid() {
  const field = useFieldContext<unknown>()
  return field.state.meta.errors.length > 0 && (field.state.meta.isTouched || field.form.state.submissionAttempts > 0)
}

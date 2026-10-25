import type { ProductForm as ProductFormApi } from '../hooks/use-product-form'
import { ProductBasicFields } from './product-basic-fields'
import { ProductDetailsFields } from './product-details-fields'
import { ProductSeoFields } from './product-seo-fields'

interface ProductFormProps {
  form: ProductFormApi
  submitLabel: string
  slugLocked?: boolean
  isEdit?: boolean
  readOnly?: boolean
}

export function ProductForm({ form, submitLabel, slugLocked = false, isEdit = false, readOnly }: ProductFormProps) {
  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <fieldset disabled={readOnly} className="grid gap-6">
        <ProductBasicFields form={form} slugLocked={slugLocked} isEdit={isEdit} />
        <ProductDetailsFields form={form} />
        <ProductSeoFields form={form} />
      </fieldset>
      {readOnly ? null : (
        <form.AppForm>
          <form.StickySaveBar>
            <form.SubmitButton requireDirty={isEdit}>{submitLabel}</form.SubmitButton>
          </form.StickySaveBar>
        </form.AppForm>
      )}
    </form>
  )
}

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useCrud from '@/hooks/core/useCrud'
import { categoryService } from '@/api'
import Category from '@/models/entities/Category'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { categoryFormSchema, type CategoryFormValues } from '@/schemas/category'

export interface CategoryFormProps {
  categoryId: string | number | null
  onSaved: () => void
  onCancelled: () => void
}

export function CategoryForm({
  categoryId,
  onSaved,
  onCancelled,
}: CategoryFormProps) {
  const crud = useCrud<Category>({
    service: categoryService,
    queryKey: 'categories',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const saving = crud.isCreating || crud.isUpdating
  const isEditing = categoryId !== null && categoryId !== undefined

  const { data: editCategoryRes, isLoading: loadingEdit } = crud.useFindById({
    id: categoryId ?? '',
  })
  // El backend envuelve las respuestas en { data: ... }
  const editCategory = (
    editCategoryRes as unknown as { data: Category } | undefined
  )?.data

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (editCategory && isEditing) {
      reset({
        name: editCategory.name ?? '',
        description: editCategory.description ?? '',
      })
    }
  }, [editCategory, isEditing, reset])

  const onSubmit = async (values: CategoryFormValues) => {
    setFormError(null)
    const payload: Partial<Category> = {
      name: values.name,
      description: values.description || undefined,
    }

    try {
      if (isEditing) {
        await crud.update({ id: categoryId, payload })
      } else {
        await crud.create({ payload: payload as Category })
      }
      onSaved()
    } catch {
      setFormError(
        'No se pudo guardar la categoría. Revisa los datos e intenta de nuevo.'
      )
    }
  }

  if (isEditing && loadingEdit) {
    return (
      <div className="form-loading-state">
        Cargando datos de la categoría...
      </div>
    )
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        label="Nombre"
        htmlFor="category-name"
        error={errors.name?.message}
      >
        <input
          id="category-name"
          className="field-input"
          type="text"
          {...register('name')}
        />
      </FormField>

      <FormField
        label="Descripción"
        htmlFor="category-description"
        error={errors.description?.message}
      >
        <textarea
          id="category-description"
          className="field-input"
          rows={3}
          {...register('description')}
        />
      </FormField>

      {formError && <span className="form-error">{formError}</span>}

      <div className="form-actions">
        <Button variant="ghost" onClick={onCancelled}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

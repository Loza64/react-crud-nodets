import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useCrud from '@/hooks/core/useCrud'
import { productService, categoryService, photoService } from '@/api'
import Product from '@/models/entities/Product'
import Category from '@/models/entities/Category'
import Photo from '@/models/entities/Photo'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { SelectApi } from '@/components/ui/SelectApi'
import { ImageDropzone } from '@/components/ui/ImageDropzone'
import { productFormSchema, type ProductFormValues } from '@/schemas/product'
import type ImageAsset from '@/models/app/photos/ImageAsset'

export interface ProductFormProps {
  productId: string | number | null
  onSaved: () => void
  onCancelled: () => void
}

export function ProductForm({
  productId,
  onSaved,
  onCancelled,
}: ProductFormProps) {
  const crud = useCrud<Product>({
    service: productService,
    queryKey: 'products',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [gallery, setGallery] = useState<ImageAsset[]>([])
  const [uploading, setUploading] = useState(false)
  const saving = crud.isCreating || crud.isUpdating || uploading
  const isEditing = productId !== null && productId !== undefined

  const { data: editProductRes, isLoading: loadingEdit } = crud.useFindById({
    id: productId ?? '',
  })
  // El backend envuelve las respuestas en { data: ... }
  const editProduct = (
    editProductRes as unknown as { data: Product } | undefined
  )?.data

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: '', description: '', price: 0, in_stock: true },
  })

  useEffect(() => {
    if (editProduct && isEditing) {
      reset({
        name: editProduct.name ?? '',
        description: editProduct.description ?? '',
        price: Number(editProduct.price),
        in_stock: editProduct.in_stock,
        category: editProduct.category,
      })
      queueMicrotask(() => {
        setGallery(
          (editProduct.photos ?? []).map((photo) => ({
            id: photo.id as number,
            url: photo.url,
          }))
        )
      })
    }
  }, [editProduct, isEditing, reset])

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null)
    try {
      const pendingFiles = gallery.filter((asset) => asset.file)
      let uploadedPhotos: Photo[] = []

      if (pendingFiles.length) {
        setUploading(true)
        const formData = new FormData()
        pendingFiles.forEach((asset) => {
          if (asset.file) {
            formData.append('files', asset.file)
          }
        })
        const res = await photoService.create({ payload: formData })
        uploadedPhotos = (res as unknown as { data: Photo[] }).data ?? []
        setUploading(false)
      }

      const existingPhotoIds = gallery
        .filter((asset) => !asset.file && asset.id !== undefined)
        .map((asset) => ({ id: asset.id as number }))
      const newPhotoIds = uploadedPhotos.map((photo) => ({
        id: photo.id as number,
      }))

      const payload: Partial<Product> = {
        name: values.name,
        description: values.description || undefined,
        price: values.price,
        in_stock: values.in_stock,
        category: { id: values.category.id } as Category,
        photos: [...existingPhotoIds, ...newPhotoIds] as Photo[],
      }

      if (isEditing) {
        await crud.update({ id: productId, payload })
      } else {
        await crud.create({ payload: payload as Product })
      }
      onSaved()
    } catch {
      setUploading(false)
      setFormError(
        'No se pudo guardar el producto. Revisa los datos e intenta de nuevo.'
      )
    }
  }

  if (isEditing && loadingEdit) {
    return (
      <div className="form-loading-state">Cargando datos del producto...</div>
    )
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        label="Nombre"
        htmlFor="product-name"
        error={errors.name?.message}
      >
        <input
          id="product-name"
          className="field-input"
          type="text"
          {...register('name')}
        />
      </FormField>

      <FormField
        label="Descripción"
        htmlFor="product-description"
        error={errors.description?.message}
      >
        <textarea
          id="product-description"
          className="field-input"
          rows={3}
          {...register('description')}
        />
      </FormField>

      <FormField
        label="Precio"
        htmlFor="product-price"
        error={errors.price?.message}
      >
        <input
          id="product-price"
          className="field-input"
          type="number"
          step="0.01"
          min="0"
          {...register('price', { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="Categoría" error={errors.category?.message}>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <SelectApi<Category>
              service={categoryService}
              querySearch={(search) => ({ search })}
              queryParams={{ pageSize: 100 }}
              renderOption={(item) => item.name ?? ''}
              value={field.value ?? null}
              onChange={(value) =>
                field.onChange(Array.isArray(value) ? null : value)
              }
              placeholder="Selecciona una categoría"
              notFoundText="No se encontraron categorías"
            />
          )}
        />
      </FormField>

      <FormField label="Fotos" hint="Puedes soltar varias imágenes a la vez.">
        <ImageDropzone
          value={gallery}
          onChange={setGallery}
          maxFiles={6}
          onError={setFormError}
        />
      </FormField>

      <label className="form-toggle">
        <input type="checkbox" {...register('in_stock')} />
        Producto en stock
      </label>

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

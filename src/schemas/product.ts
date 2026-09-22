import { z } from 'zod'
import type Category from '@/models/entities/Category'

export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre es obligatorio.')
    .max(150, 'Máximo 150 caracteres.'),
  description: z.string().optional(),
  price: z
    .number({ error: 'Ingresa un precio válido.' })
    .positive('El precio debe ser mayor a 0.'),
  in_stock: z.boolean(),
  category: z.custom<Category>(
    (value) =>
      !!value && typeof value === 'object' && 'id' in (value as object),
    { message: 'Selecciona una categoría.' }
  ),
})
export type ProductFormValues = z.infer<typeof productFormSchema>

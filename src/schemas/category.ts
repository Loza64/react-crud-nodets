import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre es obligatorio.')
    .max(120, 'Máximo 120 caracteres.'),
  description: z.string().optional(),
})
export type CategoryFormValues = z.infer<typeof categoryFormSchema>

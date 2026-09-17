import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug invalido'),
  description: z.string().min(1, 'Descripcion requerida').max(5000),
  price: z.number().int().positive('Precio debe ser mayor a 0'),
  currency: z.enum(['mxn', 'usd', 'eur']).default('mxn'),
  images: z.array(z.string().url()).min(1, 'Al menos una imagen'),
  fileKeys: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  accessType: z.enum(['purchase', 'subscription']).default('purchase'),
})

export const checkoutSchema = z.object({
  productId: z.string().min(1),
  plan: z.enum(['monthly', 'yearly']).optional(),
  mode: z.enum(['subscription', 'purchase']),
})

export const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Minimo 8 caracteres'),
})

export const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
})

export const tagSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(50),
})

export const renameTagSchema = z.object({
  oldName: z.string().min(1),
  newName: z.string().min(1).max(50),
})

export const confirmUploadSchema = z.object({
  productId: z.string().min(1),
  key: z.string().min(1).refine(
    (key) => !key.includes('..') && !key.startsWith('/'),
    'Key invalida'
  ),
})

export const presignSchema = z.object({
  productId: z.string().min(1),
  fileName: z.string().min(1).max(255).refine(
    (name) => !name.includes('..'),
    'Nombre de archivo invalido'
  ),
  contentType: z.string().min(1),
})

export function validateRequest<T extends z.ZodType>(schema: T, data: unknown) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(', ')
    return { success: false as const, error: errors, data: null }
  }
  return { success: true as const, error: null, data: result.data }
}

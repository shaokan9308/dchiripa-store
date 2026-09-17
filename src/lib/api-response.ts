import { NextResponse } from 'next/server'

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function apiUnauthorized() {
  return apiError('No autorizado', 401)
}

export function apiForbidden() {
  return apiError('No autorizado', 403)
}

export function apiNotFound(resource = 'Recurso') {
  return apiError(`${resource} no encontrado`, 404)
}

export function apiInternalError(message = 'Error interno') {
  return apiError(message, 500)
}

export function apiRateLimited() {
  return apiError('Demasiadas peticiones', 429)
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

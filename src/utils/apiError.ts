export interface ApiFieldError {
  type?: string
  msg?: string
  path?: string
  location?: string
  value?: unknown
}

export interface ApiErrorBody {
  status?: string
  message?: string
  errors?: ApiFieldError[]
}

function formatFieldErrors(errors: ApiFieldError[]): string {
  return errors.map((e) => e.msg?.trim()).filter(Boolean).join('. ')
}

export function parseApiErrorBody(data: unknown, fallback = 'Something went wrong'): string {
  if (Array.isArray(data)) {
    const message = formatFieldErrors(data)
    if (message) return message
  }

  if (data && typeof data === 'object') {
    const body = data as ApiErrorBody
    if (Array.isArray(body.errors) && body.errors.length) {
      const message = formatFieldErrors(body.errors)
      if (message) return message
    }
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message.trim()
    }
  }

  return fallback
}

export function parseApiError(err: unknown, fallback = 'Something went wrong'): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (data !== undefined) {
    return parseApiErrorBody(data, fallback)
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

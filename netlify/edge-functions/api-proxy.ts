import type { Config, Context } from '@netlify/edge-functions'

const API_ORIGIN = 'https://admin-moderator-backend-staging.up.railway.app'

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url)
  const targetUrl = `${API_ORIGIN}${url.pathname}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  const init: RequestInit = {
    method: request.method,
    headers,
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
  }

  const response = await fetch(targetUrl, init)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

export const config: Config = {
  path: '/api/*',
}

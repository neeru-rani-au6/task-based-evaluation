import type { User } from '../types'

const TOKEN_COOKIE = 'token'
const USER_COOKIE = 'user'
const COOKIE_MAX_AGE_DAYS = 7

function setCookie(name: string, value: string) {
  const expires = new Date(Date.now() + COOKIE_MAX_AGE_DAYS * 864e5).toUTCString()
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function getAuthToken(): string | null {
  return getCookie(TOKEN_COOKIE)
}

export function getAuthUser(): User | null {
  const saved = getCookie(USER_COOKIE)
  if (!saved) return null
  try {
    return JSON.parse(saved) as User
  } catch {
    return null
  }
}

export function setAuthSession(token: string, user: User) {
  setCookie(TOKEN_COOKIE, token)
  setCookie(USER_COOKIE, JSON.stringify(user))
}

export function clearAuthSession() {
  removeCookie(TOKEN_COOKIE)
  removeCookie(USER_COOKIE)
}

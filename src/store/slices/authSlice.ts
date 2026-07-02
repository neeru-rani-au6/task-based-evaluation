import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types'

interface AuthState {
  token: string | null
  user: User | null
}

const loadUser = (): User | null => {
  const saved = localStorage.getItem('user')
  if (!saved) return null
  try {
    return JSON.parse(saved) as User
  } catch {
    return null
  }
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: loadUser(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer

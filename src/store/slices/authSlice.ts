import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types'
import { clearAuthSession, getAuthToken, getAuthUser, setAuthSession } from '../../utils/authStorage'

interface AuthState {
  token: string | null
  user: User | null
}

const initialState: AuthState = {
  token: getAuthToken(),
  user: getAuthUser(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      setAuthSession(action.payload.token, action.payload.user)
    },
    logout: (state) => {
      state.token = null
      state.user = null
      clearAuthSession()
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer

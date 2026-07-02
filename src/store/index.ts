import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import testFlowReducer from './slices/testFlowSlice'
import testsReducer from './slices/testsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    testFlow: testFlowReducer,
    tests: testsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

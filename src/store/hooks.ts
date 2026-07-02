import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { login, logout } from './slices/authSlice'
import {
  addQuestion as addQuestionAction,
  clearTestFlow as clearTestFlowAction,
  removeQuestion as removeQuestionAction,
  setCurrentTest as setCurrentTestAction,
  setQuestions as setQuestionsAction,
  updateQuestion as updateQuestionAction,
} from './slices/testFlowSlice'
import type { AppDispatch, RootState } from './index'
import type { Question, Test, User } from '../types'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function useAuth() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const token = useAppSelector((s) => s.auth.token)

  return {
    user,
    token,
    isAuthenticated: !!token,
    login: (newToken: string, newUser: User) => dispatch(login({ token: newToken, user: newUser })),
    logout: () => dispatch(logout()),
  }
}

export function useTestFlow() {
  const dispatch = useAppDispatch()
  const currentTest = useAppSelector((s) => s.testFlow.currentTest)
  const questions = useAppSelector((s) => s.testFlow.questions)

  const setCurrentTest = useCallback(
    (test: Test | null) => dispatch(setCurrentTestAction(test)),
    [dispatch],
  )
  const setQuestions = useCallback(
    (next: Question[]) => dispatch(setQuestionsAction(next)),
    [dispatch],
  )
  const addQuestion = useCallback(
    (question: Question) => dispatch(addQuestionAction(question)),
    [dispatch],
  )
  const updateQuestion = useCallback(
    (index: number, question: Question) => dispatch(updateQuestionAction({ index, question })),
    [dispatch],
  )
  const removeQuestion = useCallback(
    (index: number) => dispatch(removeQuestionAction(index)),
    [dispatch],
  )
  const clearTestFlow = useCallback(() => dispatch(clearTestFlowAction()), [dispatch])

  return useMemo(
    () => ({
      currentTest,
      questions,
      setCurrentTest,
      setQuestions,
      addQuestion,
      updateQuestion,
      removeQuestion,
      clearTestFlow,
    }),
    [
      currentTest,
      questions,
      setCurrentTest,
      setQuestions,
      addQuestion,
      updateQuestion,
      removeQuestion,
      clearTestFlow,
    ],
  )
}

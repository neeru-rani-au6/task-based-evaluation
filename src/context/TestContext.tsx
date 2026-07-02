import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Question, Test } from '../types'

interface TestContextType {
  currentTest: Test | null
  setCurrentTest: (test: Test | null) => void
  questions: Question[]
  setQuestions: (questions: Question[]) => void
  addQuestion: (question: Question) => void
  updateQuestion: (index: number, question: Question) => void
  removeQuestion: (index: number) => void
  clearTestFlow: () => void
}

const TestContext = createContext<TestContextType | null>(null)

export function TestProvider({ children }: { children: ReactNode }) {
  const [currentTest, setCurrentTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  const value = useMemo(
    () => ({
      currentTest,
      setCurrentTest,
      questions,
      setQuestions,
      addQuestion: (question: Question) => setQuestions((prev) => [...prev, question]),
      updateQuestion: (index: number, question: Question) =>
        setQuestions((prev) => prev.map((q, i) => (i === index ? question : q))),
      removeQuestion: (index: number) => setQuestions((prev) => prev.filter((_, i) => i !== index)),
      clearTestFlow: () => {
        setCurrentTest(null)
        setQuestions([])
      },
    }),
    [currentTest, questions],
  )

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>
}

export function useTestFlow() {
  const context = useContext(TestContext)
  if (!context) throw new Error('useTestFlow must be used within TestProvider')
  return context
}

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Question, Test } from '../../types'

interface TestFlowState {
  currentTest: Test | null
  questions: Question[]
}

const initialState: TestFlowState = {
  currentTest: null,
  questions: [],
}

const testFlowSlice = createSlice({
  name: 'testFlow',
  initialState,
  reducers: {
    setCurrentTest: (state, action: PayloadAction<Test | null>) => {
      state.currentTest = action.payload
    },
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload
    },
    addQuestion: (state, action: PayloadAction<Question>) => {
      state.questions.push(action.payload)
    },
    updateQuestion: (state, action: PayloadAction<{ index: number; question: Question }>) => {
      const { index, question } = action.payload
      if (index >= 0 && index < state.questions.length) {
        state.questions[index] = question
      }
    },
    removeQuestion: (state, action: PayloadAction<number>) => {
      state.questions = state.questions.filter((_, i) => i !== action.payload)
    },
    clearTestFlow: (state) => {
      state.currentTest = null
      state.questions = []
    },
  },
})

export const {
  setCurrentTest,
  setQuestions,
  addQuestion,
  updateQuestion,
  removeQuestion,
  clearTestFlow,
} = testFlowSlice.actions
export default testFlowSlice.reducer

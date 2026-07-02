import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getAllTests, getTestById } from '../../api/endpoints'
import { parseApiError, parseApiErrorBody } from '../../utils/apiError'
import type { Test } from '../../types'

interface TestsState {
  list: Test[]
  byId: Record<string, Test>
  loading: boolean
  refreshing: boolean
  testLoading: Record<string, boolean>
  error: string | null
  lastFetched: number | null
}

const initialState: TestsState = {
  list: [],
  byId: {},
  loading: false,
  refreshing: false,
  testLoading: {},
  error: null,
  lastFetched: null,
}

function indexTests(tests: Test[]) {
  const byId: Record<string, Test> = {}
  tests.forEach((test) => {
    byId[test.id] = test
  })
  return byId
}

export const fetchTests = createAsyncThunk<Test[], void, { rejectValue: string; state: { tests: TestsState } }>(
  'tests/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllTests()
      if (res.data.status === 'success') return res.data.data
      return rejectWithValue(parseApiErrorBody(res.data, 'Failed to fetch tests'))
    } catch (err: unknown) {
      return rejectWithValue(parseApiError(err, 'Failed to fetch tests'))
    }
  },
  {
    condition: (_, { getState }) => {
      const { loading, refreshing } = getState().tests
      return !loading && !refreshing
    },
  },
)

export const fetchTestById = createAsyncThunk<Test, string, { rejectValue: string; state: { tests: TestsState } }>(
  'tests/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getTestById(id)
      if (res.data.status === 'success') return res.data.data
      return rejectWithValue(parseApiErrorBody(res.data, 'Failed to fetch test'))
    } catch (err: unknown) {
      return rejectWithValue(parseApiError(err, 'Failed to fetch test'))
    }
  },
  {
    condition: (id, { getState }) => !getState().tests.testLoading[id],
  },
)

const testsSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    upsertTest: (state, action: PayloadAction<Test>) => {
      const test = action.payload
      const existingIndex = state.list.findIndex((t) => t.id === test.id)
      if (existingIndex >= 0) {
        state.list[existingIndex] = test
      } else {
        state.list.unshift(test)
      }
      state.byId[test.id] = test
    },
    removeTest: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.list = state.list.filter((t) => t.id !== id)
      delete state.byId[id]
    },
    clearTestsError: (state) => {
      state.error = null
    },
    clearTests: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        if (state.list.length > 0) {
          state.refreshing = true
        } else {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.list = action.payload
        state.byId = { ...state.byId, ...indexTests(action.payload) }
        state.loading = false
        state.refreshing = false
        state.lastFetched = Date.now()
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false
        state.refreshing = false
        if (!state.list.length) {
          state.error = action.payload || 'Failed to fetch tests'
        }
      })
      .addCase(fetchTestById.pending, (state, action) => {
        state.testLoading[action.meta.arg] = true
      })
      .addCase(fetchTestById.fulfilled, (state, action) => {
        const test = action.payload
        state.byId[test.id] = test
        const index = state.list.findIndex((t) => t.id === test.id)
        if (index >= 0) {
          state.list[index] = test
        }
        state.testLoading[test.id] = false
      })
      .addCase(fetchTestById.rejected, (state, action) => {
        state.testLoading[action.meta.arg] = false
      })
  },
})

export const { upsertTest, removeTest, clearTestsError, clearTests } = testsSlice.actions
export default testsSlice.reducer

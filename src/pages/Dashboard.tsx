import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { updateTest } from '../api/endpoints'
import { useAppDispatch, useAppSelector, useTestFlow } from '../store/hooks'
import { fetchTests, removeTest } from '../store/slices/testsSlice'
import { PageHeader, StatusBadge } from '../components/ui'
import { colors } from '../theme'
import { parseApiError } from '../utils/apiError'
import type { Test } from '../types'

const STATUS_TABS = ['all', 'draft', 'live'] as const
const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'chapterwise', label: 'Chapter Wise' },
  { value: 'pyq', label: 'PYQ' },
  { value: 'mock', label: 'Mock Test' },
]

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25]

function prettyType(type?: string) {
  if (type === 'chapterwise') return 'Chapter Wise'
  if (type === 'pyq') return 'PYQ'
  if (type === 'mock') return 'Mock Test'
  return type || '—'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { setCurrentTest, clearTestFlow } = useTestFlow()
  const tests = useAppSelector((s) => s.tests.list)
  const loading = useAppSelector((s) => s.tests.loading)
  const fetchError = useAppSelector((s) => s.tests.error)
  const [actionError, setActionError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_TABS)[number]>('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    dispatch(fetchTests())
  }, [dispatch])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tests.filter((t) => {
      const matchSearch = t.name?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q)
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'draft' && (!t.status || t.status === 'draft')) ||
        t.status === statusFilter
      const matchType = typeFilter === 'all' || t.type === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [tests, search, statusFilter, typeFilter])

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter, typeFilter])

  const paginated = useMemo(() => {
    const start = page * rowsPerPage
    return filtered.slice(start, start + rowsPerPage)
  }, [filtered, page, rowsPerPage])

  const handleDelete = async (test: Test) => {
    if (!window.confirm(`Delete "${test.name}"?`)) return
    setActionError('')
    try {
      await updateTest(test.id, { status: 'unpublished' })
      dispatch(removeTest(test.id))
    } catch (err: unknown) {
      setActionError(parseApiError(err, 'Failed to delete test'))
    }
  }

  const showInitialLoader = loading && tests.length === 0
  const error = actionError || fetchError

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Tests"
        subtitle="Create, manage and publish your tests."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              clearTestFlow()
              navigate('/tests/create')
            }}
          >
            Create New Test
          </Button>
        }
      />

      <Paper elevation={0} sx={{ p: 2, border: `1px solid ${colors.line}`, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name or subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: colors.muted }} />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={0.5}>
            {STATUS_TABS.map((s) => (
              <Button
                key={s}
                size="small"
                onClick={() => setStatusFilter(s)}
                sx={{
                  textTransform: 'capitalize',
                  bgcolor: statusFilter === s ? colors.brand50 : 'transparent',
                  color: statusFilter === s ? colors.brand700 : colors.muted,
                  minWidth: 64,
                }}
              >
                {s}
              </Button>
            ))}
          </Stack>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${colors.line}`, borderRadius: 2 }}>
        {showInitialLoader ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">No tests found</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  {['Name', 'Subject', 'Type', 'Status', 'Created', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: colors.muted, fontSize: 13 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((test) => (
                  <TableRow key={test.id} hover>
                    <TableCell>
                      <Typography fontWeight={600} fontSize={14}>
                        {test.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {test.total_marks} marks · {(test.questions?.length ?? 0)}/{test.total_questions} questions
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{test.subject || '—'}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{prettyType(test.type)}</TableCell>
                    <TableCell>
                      <StatusBadge status={test.status} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>
                      {test.created_at
                        ? new Date(test.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {/* <IconButton size="small" onClick={() => navigate(`/tests/${test.id}/preview`)}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton> */}
                      <IconButton
                        size="small"
                        onClick={() => {
                          setCurrentTest(test)
                          navigate(`/tests/${test.id}/edit`)
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Add Questions"
                        onClick={() => {
                          setCurrentTest(test)
                          navigate(`/tests/${test.id}/questions`)
                        }}
                      >
                        <QuizOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(test)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(0)
              }}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            />
          </>
        )}
      </TableContainer>
    </Stack>
  )
}

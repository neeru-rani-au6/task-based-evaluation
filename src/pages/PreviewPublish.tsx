import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { fetchBulkQuestions, getTestById, updateTest } from '../api/endpoints'
import QuestionSidebar from '../components/questions/QuestionSidebar'
import TestSummaryCard from '../components/questions/TestSummaryCard'
import { colors } from '../theme'
import { parseApiError, parseApiErrorBody } from '../utils/apiError'
import type { Question, Test } from '../types'

type PublishMode = 'now' | 'schedule'
type LiveUntil = 'always' | '1week' | '2weeks' | '3weeks' | '1month' | 'custom'

const LIVE_UNTIL_OPTIONS: { value: LiveUntil; label: string }[] = [
  { value: 'always', label: 'Always Available' },
  { value: '1week', label: '1 Week' },
  { value: '2weeks', label: '2 Weeks' },
  { value: '3weeks', label: '3 Weeks' },
  { value: '1month', label: '1 Month' },
  { value: 'custom', label: 'Custom Duration' },
]

function prettyType(type?: string) {
  if (type === 'chapterwise') return 'Chapter Wise'
  if (type === 'pyq') return 'PYQ'
  if (type === 'mock') return 'Mock Test'
  return 'Chapter Wise'
}

export default function PreviewPublishPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState('')
  const [publishMode, setPublishMode] = useState<PublishMode>('now')
  const [liveUntil, setLiveUntil] = useState<LiveUntil>('custom')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      try {
        const testRes = await getTestById(id)
        if (testRes.data.status === 'success') {
          const testData = testRes.data.data
          setTest(testData)
          if (testData.questions?.length) {
            const qRes = await fetchBulkQuestions(testData.questions)
            if (qRes.data.status === 'success') setQuestions(qRes.data.data)
          }
        }
      } catch {
        setError('Failed to load test preview')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const totalQuestions = test?.total_questions ?? 0
  const allDone = questions.length >= totalQuestions && totalQuestions > 0
  const completed = useMemo(
    () => Array.from({ length: totalQuestions }, (_, i) => i < questions.length),
    [totalQuestions, questions.length],
  )

  const handleConfirm = async () => {
    if (!id || !test) return

    if (publishMode === 'schedule' && !scheduleDate) {
      setError('Please select a publish date')
      return
    }
    if (liveUntil === 'custom' && !endDate) {
      setError('Please select an end date')
      return
    }

    setPublishing(true)
    setError('')
    try {
      const payload: Partial<Test> = { status: 'live' }

      if (publishMode === 'schedule' && scheduleDate) {
        const time = scheduleTime || '00:00'
        payload.scheduled_date = new Date(`${scheduleDate}T${time}`).toISOString()
      }

      if (liveUntil === 'custom' && endDate) {
        const time = endTime || '23:59'
        payload.expiry_date = new Date(`${endDate}T${time}`).toISOString()
      }

      const res = await updateTest(id, payload)
      if (res.data.status === 'success') {
        setPublished(true)
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setError(parseApiErrorBody(res.data, 'Failed to publish test'))
      }
    } catch (err: unknown) {
      setError(parseApiError(err, 'Failed to publish test'))
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (published) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: `1px solid ${colors.line}`, borderRadius: 2 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
          <Typography variant="h5" fontWeight={700}>
            Test Published Successfully!
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Redirecting to dashboard...
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (!test) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
        <Alert severity="error">Test not found</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
        <QuestionSidebar total={totalQuestions} currentIndex={0} completed={completed} onSelect={() => {}} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <Box sx={{ px: { xs: 2, md: 3 }, pt: 2, pb: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" color="text.secondary">
                Test Creation
              </Typography>
              <Typography color={colors.line}>/</Typography>
              <Typography variant="body2" fontWeight={600} color={colors.ink}>
                {prettyType(test.type)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" fontWeight={600} color={colors.ink}>
                Test created
              </Typography>
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: '#22c55e !important' }} />}
                label={allDone ? `All ${totalQuestions} Questions done` : `${questions.length}/${totalQuestions} Questions done`}
                size="small"
                sx={{
                  color: '#22c55e',
                  borderColor: '#22c55e',
                  bgcolor: '#f0fdf4',
                  fontWeight: 600,
                  height: 26,
                  '& .MuiChip-icon': { color: '#fff' },
                }}
              />
            </Stack>

            <TestSummaryCard test={test} onEdit={() => navigate(`/tests/${id}/edit`)} />

            {error && <Alert severity="error">{error}</Alert>}

            <Paper elevation={0} sx={{ border: `1px solid ${colors.line}`, borderRadius: 2, p: 3, bgcolor: '#fff' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                {(['now', 'schedule'] as const).map((mode) => (
                  <Button
                    key={mode}
                    size="small"
                    onClick={() => setPublishMode(mode)}
                    sx={{
                      px: 2.5,
                      py: 0.75,
                      borderRadius: 999,
                      fontWeight: publishMode === mode ? 700 : 500,
                      bgcolor: publishMode === mode ? '#f3f4f6' : 'transparent',
                      color: publishMode === mode ? colors.ink : colors.muted,
                      border: `1px solid ${colors.line}`,
                    }}
                  >
                    {mode === 'now' ? 'Publish Now' : 'Schedule Publish'}
                  </Button>
                ))}
              </Stack>

              {publishMode === 'schedule' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                    Select Date and Time
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        Select Date
                      </Typography>
                      <TextField
                        type="date"
                        size="small"
                        fullWidth
                        placeholder="Select Date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        Select Time
                      </Typography>
                      <TextField
                        type="time"
                        size="small"
                        fullWidth
                        placeholder="Select Time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Live Until
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose how long this test should remain available on the platform.
              </Typography>

              <RadioGroup
                value={liveUntil}
                onChange={(e) => setLiveUntil(e.target.value as LiveUntil)}
                sx={{ mb: liveUntil === 'custom' ? 2 : 3 }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 1,
                  }}
                >
                  {LIVE_UNTIL_OPTIONS.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={opt.value}
                      control={
                        <Radio
                          size="small"
                          sx={{
                            color: colors.line,
                            '&.Mui-checked': { color: colors.brand500 },
                          }}
                        />
                      }
                      label={opt.label}
                      sx={{
                        m: 0,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: liveUntil === opt.value ? '#fef9c3' : 'transparent',
                        '& .MuiFormControlLabel-label': { fontSize: 14 },
                      }}
                    />
                  ))}
                </Box>
              </RadioGroup>

              {liveUntil === 'custom' && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Select End Date
                    </Typography>
                    <TextField
                      type="date"
                      size="small"
                      fullWidth
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Select End Time
                    </Typography>
                    <TextField
                      type="time"
                      size="small"
                      fullWidth
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                    />
                  </Box>
                </Box>
              )}

              {!allDone && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Add all {totalQuestions} questions to publish ({questions.length}/{totalQuestions} added).
                </Alert>
              )}

              <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
                <Button variant="text" onClick={() => navigate('/dashboard')} sx={{ color: colors.muted }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disabled={publishing || !allDone || test.status === 'live'}
                  onClick={handleConfirm}
                  sx={{ px: 3 }}
                >
                  {publishing ? 'Publishing...' : test.status === 'live' ? 'Already Published' : 'Confirm'}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

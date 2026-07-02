import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import AddIcon from '@mui/icons-material/Add'
import {
  bulkCreateQuestions,
  fetchBulkQuestions,
  getSubjects,
  getTestById,
} from '../api/endpoints'
import { useTestFlow } from '../context/TestContext'
import QuestionSidebar from '../components/questions/QuestionSidebar'
import QuestionRichTextEditor, { stripHtml } from '../components/questions/QuestionRichTextEditor'
import TestSummaryCard from '../components/questions/TestSummaryCard'
import { colors } from '../theme'
import { parseApiError, parseApiErrorBody } from '../utils/apiError'
import { parseQuestionsCsv } from '../utils/parseQuestionsCsv'
import type { Test } from '../types'

interface QuestionDraft {
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: string
  explanation: string
  difficulty: string
  topic: string
  sub_topic: string
}

const emptyDraft = (): QuestionDraft => ({
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: 'option1',
  explanation: '',
  difficulty: 'easy',
  topic: '',
  sub_topic: '',
})

function isDraftComplete(d: QuestionDraft): boolean {
  return !!(
    stripHtml(d.question) &&
    d.option1.trim() &&
    d.option2.trim() &&
    d.option3.trim() &&
    d.option4.trim()
  )
}

function prettyType(type?: string) {
  if (type === 'chapterwise') return 'Chapter Wise'
  if (type === 'pyq') return 'PYQ'
  if (type === 'mock') return 'Mock Test'
  return 'Chapter Wise'
}

function SettingsSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
        {label}
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
          sx={{
            bgcolor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.line },
          }}
          renderValue={(selected) =>
            selected ? (
              selected
            ) : (
              <Typography component="span" variant="body2" color="text.secondary">
                Select from Drop-down
              </Typography>
            )
          }
        >
          {options.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default function AddQuestionsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setCurrentTest } = useTestFlow()
  const [test, setTest] = useState<Test | null>(null)
  const [drafts, setDrafts] = useState<QuestionDraft[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const csvInputRef = useRef<HTMLInputElement>(null)

  const { register, control, reset, getValues, setValue, formState: { errors } } = useForm<QuestionDraft>({
    defaultValues: emptyDraft(),
  })

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await getTestById(id)
        if (res.data.status !== 'success') return
        const testData = res.data.data
        setTest(testData)
        setCurrentTest(testData)

        const total = testData.total_questions || 1
        let initial = Array.from({ length: total }, () => emptyDraft())

        if (testData.questions?.length) {
          const qRes = await fetchBulkQuestions(testData.questions)
          if (qRes.data.status === 'success') {
            qRes.data.data.forEach((q, i) => {
              if (i < total) {
                initial[i] = {
                  question: q.question,
                  option1: q.option1,
                  option2: q.option2,
                  option3: q.option3,
                  option4: q.option4,
                  correct_option: q.correct_option,
                  explanation: q.explanation || '',
                  difficulty: q.difficulty || 'easy',
                  topic: q.topic || '',
                  sub_topic: q.sub_topic || '',
                }
              }
            })
          }
        }

        setDrafts(initial)
        reset(initial[0])
      } catch {
        setError('Failed to load test')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, reset, setCurrentTest])

  const completed = useMemo(() => drafts.map(isDraftComplete), [drafts])

  const saveCurrentToDrafts = (): QuestionDraft[] => {
    const values = getValues()
    const updated = drafts.map((d, i) => (i === currentIndex ? values : d))
    setDrafts(updated)
    return updated
  }

  const switchQuestion = (index: number) => {
    const updated = saveCurrentToDrafts()
    setCurrentIndex(index)
    reset(updated[index] || emptyDraft())
  }

  const clearCurrentEdits = () => {
    reset(emptyDraft())
    setDrafts((prev) => prev.map((d, i) => (i === currentIndex ? emptyDraft() : d)))
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = parseQuestionsCsv(String(reader.result || ''))
        if (!parsed.length) {
          setError('No valid questions found in CSV. Include a header row with: question, option1, option2, option3, option4, correct_option')
          return
        }

        const current = saveCurrentToDrafts()
        const merged = current.map((draft, i) => {
          const row = parsed[i]
          if (!row) return draft
          return {
            ...draft,
            question: row.question,
            option1: row.option1,
            option2: row.option2,
            option3: row.option3,
            option4: row.option4,
            correct_option: row.correct_option || draft.correct_option,
            explanation: row.explanation ?? draft.explanation,
            difficulty: row.difficulty || draft.difficulty,
          }
        })

        setDrafts(merged)
        setCurrentIndex(0)
        reset(merged[0], { keepDefaultValues: false })
        setValue('correct_option', merged[0].correct_option)
        setError('')
      } catch {
        setError('Could not parse CSV file. Check the format and try again.')
      }
      event.target.value = ''
    }
    reader.onerror = () => {
      setError('Failed to read CSV file')
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  const handleNext = () => {
    const updated = saveCurrentToDrafts()
    const current = updated[currentIndex]
    if (!isDraftComplete(current)) {
      setError('Please fill question and all 4 options before continuing')
      return
    }
    setError('')
    if (currentIndex < updated.length - 1) {
      const next = currentIndex + 1
      setCurrentIndex(next)
      reset(updated[next])
    } else {
      void saveQuestions(updated)
    }
  }

  const handleSaveAndPreview = async () => {
    const updated = saveCurrentToDrafts()
    await saveQuestions(updated)
  }

  const saveQuestions = async (allDrafts: QuestionDraft[]) => {
    const filled = allDrafts.filter(isDraftComplete)
    if (filled.length === 0) {
      setError('Add at least one complete question')
      return
    }

    setSaving(true)
    setError('')
    try {
      const subjectsRes = await getSubjects()
      const subjectId = subjectsRes.data.data.find(
        (s) => s.name === test?.subject || s.id === test?.subject,
      )?.id

      if (!subjectId) {
        setError('Could not resolve subject')
        return
      }

      const payload = filled.map((d) => ({
        type: 'mcq',
        question: d.question,
        option1: d.option1,
        option2: d.option2,
        option3: d.option3,
        option4: d.option4,
        correct_option: d.correct_option,
        test_id: id,
        subject: subjectId,
        ...(d.explanation ? { explanation: d.explanation } : {}),
        ...(d.difficulty ? { difficulty: d.difficulty } : {}),
      }))

      const res = await bulkCreateQuestions(payload)
      if (res.data.status === 'success') {
        navigate(`/tests/${id}/preview`)
      } else {
        setError(parseApiErrorBody(res.data, 'Failed to save questions'))
      }
    } catch (err: unknown) {
      setError(parseApiError(err, 'Failed to save questions'))
    } finally {
      setSaving(false)
    }
  }

  if (loading || !test) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography color="text.secondary">Loading question editor...</Typography>
      </Box>
    )
  }

  const isLastQuestion = currentIndex === drafts.length - 1
  const topicOptions = (test.topics?.length ? test.topics : []).map((t) => ({ value: t, label: t }))
  const subTopicOptions = (test.sub_topics?.length ? test.sub_topics : []).map((t) => ({ value: t, label: t }))

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
        <QuestionSidebar
          total={drafts.length}
          currentIndex={currentIndex}
          completed={completed}
          onSelect={switchQuestion}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <Box sx={{ px: { xs: 2, md: 3 }, pt: 2, pb: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="body2" color="text.secondary">
                  Test Creation
                </Typography>
                <Typography color={colors.line}>/</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create Test
                </Typography>
                <Typography color={colors.line}>/</Typography>
                <Typography variant="body2" fontWeight={600} color={colors.ink}>
                  {prettyType(test.type)}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                onClick={handleSaveAndPreview}
                disabled={saving}
                sx={{ px: 3, fontWeight: 600 }}
              >
                Publish
              </Button>
            </Stack>

            <TestSummaryCard test={test} onEdit={() => navigate(`/tests/${id}/edit`)} />

            <Typography fontSize={15} sx={{ mt: -0.5 }}>
              <Box component="span" fontWeight={700} color="#1e3a5f">
                Question {currentIndex + 1}
              </Box>
              <Box component="span" fontWeight={500} color={colors.brand500}>
                /{drafts.length}
              </Box>
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={handleCsvUpload}
            />

            <Paper elevation={0} sx={{ border: `1px solid ${colors.line}`, borderRadius: 2, bgcolor: '#fff', overflow: 'hidden' }}>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.75,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${colors.line}`,
                  bgcolor: '#fafafa',
                }}
              >
                <Typography fontWeight={700} fontSize={15} color="text.secondary">
                  Question Editor
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      textTransform: 'none',
                      border: `1px solid ${colors.line}`,
                      color: colors.ink,
                      bgcolor: '#fff',
                      fontWeight: 600,
                      px: 1.5,
                    }}
                  >
                    MCQ
                  </Button>
                  <Button
                    size="small"
                    startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => csvInputRef.current?.click()}
                    sx={{
                      textTransform: 'none',
                      border: `1px solid ${colors.line}`,
                      color: colors.ink,
                      bgcolor: '#fff',
                      fontWeight: 600,
                      px: 1.5,
                    }}
                  >
                    CSV
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ px: 2.5, pt: 1, pb: 0.5 }}>
                <Button
                  size="small"
                  onClick={clearCurrentEdits}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#ef4444', p: 0, minWidth: 0 }}
                >
                  Delete All Edits
                </Button>
              </Box>

              <Box sx={{ px: 2.5, pb: 2.5 }}>
                <Controller
                  name="question"
                  control={control}
                  rules={{
                    validate: (v) => (stripHtml(v) ? true : 'Question is required'),
                  }}
                  render={({ field }) => (
                    <QuestionRichTextEditor
                      editorKey={currentIndex}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.question}
                      helperText={errors.question?.message}
                    />
                  )}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 1.5 }}>
                  Type the options below
                </Typography>

                {(['option1', 'option2', 'option3', 'option4'] as const).map((opt) => (
                  <Stack key={opt} direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                    <Controller
                      name="correct_option"
                      control={control}
                      render={({ field }) => (
                        <Radio
                          checked={field.value === opt}
                          onChange={() => field.onChange(opt)}
                          size="small"
                          sx={{ p: 0.5, color: colors.brand500, '&.Mui-checked': { color: colors.brand500 } }}
                        />
                      )}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type Option here"
                      error={!!errors[opt]}
                      {...register(opt, { required: 'Required' })}
                      sx={{
                        '& .MuiOutlinedInput-root': { height: 44, bgcolor: '#fff' },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setValue(opt, '')}
                      sx={{ color: colors.muted }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}

                <Typography variant="body2" fontWeight={600} sx={{ mt: 2.5, mb: 1 }}>
                  Add Solution
                </Typography>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Type here"
                    {...register('explanation')}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                  />
                  <IconButton size="small" onClick={() => setValue('explanation', '')} sx={{ color: colors.muted, mt: 0.5 }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Stack direction="row" justifyContent="center" spacing={1} sx={{ my: 2 }}>
                  <IconButton
                    size="small"
                    disabled={currentIndex === 0}
                    onClick={() => switchQuestion(currentIndex - 1)}
                    sx={{ border: `1px solid ${colors.line}`, borderRadius: 1.5, width: 32, height: 32 }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={currentIndex >= drafts.length - 1}
                    onClick={() => switchQuestion(currentIndex + 1)}
                    sx={{ border: `1px solid ${colors.line}`, borderRadius: 1.5, width: 32, height: 32 }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Divider sx={{ mb: 2.5 }} />

                <Typography variant="body2" fontWeight={700} sx={{ mb: 2 }}>
                  Question settings
                </Typography>

                <Stack spacing={2.5}>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <SettingsSelect
                        label="Level of Difficulty"
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: 'easy', label: 'Easy' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'hard', label: 'Hard' },
                        ]}
                      />
                    )}
                  />
                  <Controller
                    name="topic"
                    control={control}
                    render={({ field }) => (
                      <SettingsSelect
                        label="Topic"
                        value={field.value}
                        onChange={field.onChange}
                        options={topicOptions}
                      />
                    )}
                  />
                  <Controller
                    name="sub_topic"
                    control={control}
                    render={({ field }) => (
                      <SettingsSelect
                        label="Sub-topic"
                        value={field.value}
                        onChange={field.onChange}
                        options={subTopicOptions}
                      />
                    )}
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  borderTop: `1px solid ${colors.line}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                  bgcolor: '#fff',
                }}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#fff',
                    px: 2.5,
                  }}
                >
                  Exit Test Creation
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={saving}
                  sx={{ minWidth: 100, px: 4, fontWeight: 600 }}
                >
                  {saving ? 'Saving...' : isLastQuestion ? 'Save & Preview' : 'Next'}
                </Button>
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

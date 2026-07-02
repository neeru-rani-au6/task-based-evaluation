import { useEffect, useState, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  createTest,
  getSubjects,
  getSubTopicsByTopics,
  getTestById,
  getTopicsBySubject,
  updateTest,
} from '../api/endpoints'
import { useTestFlow } from '../context/TestContext'
import { Breadcrumb } from '../components/ui'
import { colors } from '../theme'
import { parseApiError, parseApiErrorBody } from '../utils/apiError'
import type { Subject, SubTopic, Topic } from '../types'

interface TestForm {
  name: string
  type: string
  subject: string
  topics: string[]
  sub_topics: string[]
  difficulty: string
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  total_time: number
  total_marks: number
  total_questions: number
}

const TEST_TYPES = [
  { value: 'chapterwise', label: 'Chapterwise' },
  { value: 'pyq', label: 'PYQ' },
  { value: 'mock', label: 'Mock Test' },
]

function FieldText({
  label,
  type = 'text',
  placeholder,
  error,
  helperText,
  readOnly,
  ...rest
}: {
  label: string
  type?: string
  placeholder?: string
  error?: boolean
  helperText?: string
  readOnly?: boolean
} & React.ComponentProps<typeof TextField>) {
  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        type={type}
        placeholder={placeholder }
        error={error}
        helperText={helperText}
        InputProps={{ readOnly }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: '#fff',
            '& fieldset': { borderColor: colors.line },
          },
        }}
        {...rest}
      />
    </Box>
  )
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Choose from Drop-down',
  multiple = false,
  disabled = false,
  error = false,
  helperText,
  renderValue,
}: {
  label: string
  value: string | string[]
  onChange: (value: string | string[]) => void
  options: { value: string; label: string }[]
  placeholder?: string
  multiple?: boolean
  disabled?: boolean
  error?: boolean
  helperText?: string
  renderValue?: (selected: string | string[]) => ReactNode
}) {
  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
        {label}
      </Typography>
      <FormControl fullWidth size="small" error={error}>
        <Select
          multiple={multiple}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as string | string[])}
          displayEmpty={!multiple}
          sx={{
            bgcolor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.line },
          }}
          renderValue={
            renderValue ||
            ((selected) => {
              if (multiple) {
                const items = selected as string[]
                if (!items.length) {
                  return (
                    <Typography component="span" variant="body2" color="text.secondary">
                      {placeholder}
                    </Typography>
                  )
                }
                return items.map((v) => options.find((o) => o.value === v)?.label || v).join(', ')
              }
              return (selected as string) ? (
                options.find((o) => o.value === selected)?.label || (selected as string)
              ) : (
                <Typography component="span" variant="body2" color="text.secondary">
                  {placeholder}
                </Typography>
              )
            })
          }
        >
          {options.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {helperText && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  )
}

export default function CreateTestPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { setCurrentTest } = useTestFlow()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subTopics, setSubTopics] = useState<SubTopic[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingTest, setLoadingTest] = useState(isEdit)

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<TestForm>({
    defaultValues: {
      type: 'chapterwise',
      difficulty: 'easy',
      correct_marks: 5,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: 60,
      total_marks: 100,
      total_questions: 25,
      topics: [],
      sub_topics: [],
    },
  })

  const selectedSubject = watch('subject')
  const selectedTopics = watch('topics')
  const watchedType = watch('type')
  const questionCount = useWatch({ control, name: 'total_questions' })
  const correctMarks = useWatch({ control, name: 'correct_marks' })

  useEffect(() => {
    const total = (Number(questionCount) || 0) * (Number(correctMarks) || 0)
    setValue('total_marks', total)
  }, [questionCount, correctMarks, setValue])

  useEffect(() => {
    getSubjects()
      .then((r) => {
        if (r.data.status === 'success') setSubjects(r.data.data)
      })
      .catch(() => setError('Failed to load subjects'))
  }, [])

  useEffect(() => {
    if (!isEdit || !id || subjects.length === 0) return
    setLoadingTest(true)
    getTestById(id)
      .then(async (r) => {
        if (r.data.status !== 'success') return
        const test = r.data.data
        setCurrentTest(test)
        const subjectMatch = subjects.find((s) => s.name === test.subject || s.id === test.subject)
        const subjectId = subjectMatch?.id || ''
        let topicIds: string[] = []
        let subTopicIds: string[] = []
        if (subjectId) {
          const topicsRes = await getTopicsBySubject(subjectId)
          const allTopics = topicsRes.data.data || []
          setTopics(allTopics)
          topicIds = (test.topics || [])
            .map((name) => allTopics.find((t) => t.name === name || t.id === name)?.id)
            .filter(Boolean) as string[]
          if (topicIds.length) {
            const subTopicsRes = await getSubTopicsByTopics(topicIds)
            const allSubTopics = subTopicsRes.data.data || []
            setSubTopics(allSubTopics)
            subTopicIds = (test.sub_topics || [])
              .map((name) => allSubTopics.find((s) => s.name === name || s.id === name)?.id)
              .filter(Boolean) as string[]
          }
        }
        reset({
          name: test.name,
          type: test.type || 'chapterwise',
          subject: subjectId,
          topics: topicIds,
          sub_topics: subTopicIds,
          difficulty: test.difficulty || 'easy',
          correct_marks: test.correct_marks ?? 4,
          wrong_marks: test.wrong_marks ?? -1,
          unattempt_marks: test.unattempt_marks ?? 0,
          total_time: test.total_time ?? 60,
          total_marks: test.total_marks ?? 100,
          total_questions: test.total_questions ?? 25,
        })
      })
      .finally(() => setLoadingTest(false))
  }, [isEdit, id, subjects, reset, setCurrentTest])

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([])
      return
    }
    getTopicsBySubject(selectedSubject)
      .then((r) => {
        if (r.data.status === 'success') setTopics(r.data.data)
      })
      .catch(() => setError('Failed to load topics'))
  }, [selectedSubject])

  useEffect(() => {
    if (!selectedTopics?.length) {
      setSubTopics([])
      return
    }
    getSubTopicsByTopics(selectedTopics)
      .then((r) => {
        if (r.data.status === 'success') setSubTopics(r.data.data)
      })
      .catch(() => setSubTopics([]))
  }, [selectedTopics])

  const submitTest = async (data: TestForm, goNext: boolean) => {
    if (!data.topics?.length) {
      setError('Select at least one topic')
      return
    }
    if (!data.sub_topics?.length) {
      setError('Select at least one sub topic')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        name: data.name.trim(),
        type: data.type,
        subject: data.subject,
        topics: data.topics,
        sub_topics: data.sub_topics,
        difficulty: data.difficulty,
        correct_marks: Number(data.correct_marks),
        wrong_marks: Number(data.wrong_marks),
        unattempt_marks: Number(data.unattempt_marks),
        total_time: Number(data.total_time),
        total_marks: Number(data.total_marks),
        total_questions: Number(data.total_questions),
        status: 'draft',
      }
      const res = isEdit && id ? await updateTest(id, payload) : await createTest(payload)
      if (res.data.status === 'success') {
        setCurrentTest(res.data.data)
        if (goNext) navigate(`/tests/${res.data.data.id}/questions`)
        else navigate('/dashboard')
      } else {
        setError(parseApiErrorBody(res.data, 'Failed to save test'))
      }
    } catch (err: unknown) {
      setError(parseApiError(err, 'Failed to save test'))
    } finally {
      setSaving(false)
    }
  }

  if (loadingTest) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const activeTypeLabel = TEST_TYPES.find((t) => t.value === watchedType)?.label || 'Chapterwise'

  return (
    <Stack spacing={2.5}>
      <Breadcrumb
        items={['Test Creation', isEdit ? 'Edit Test' : 'Create Test', activeTypeLabel]}
      />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {TEST_TYPES.map((t) => (
          <Button
            key={t.value}
            size="small"
            onClick={() => setValue('type', t.value)}
            sx={{
              px: 2.5,
              py: 0.75,
              borderRadius: 999,
              bgcolor: watchedType === t.value ? colors.brand50 : 'transparent',
              color: watchedType === t.value ? colors.brand700 : colors.muted,
              border: watchedType === t.value ? 'none' : `1px solid ${colors.line}`,
              fontWeight: 600,
            }}
          >
            {t.label}
          </Button>
        ))}
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper
        component="form"
        onSubmit={handleSubmit((d) => submitTest(d, true))}
        elevation={0}
        sx={{
          border: `1px solid ${colors.brand100}`,
          borderRadius: 2,
          p: 3,
          bgcolor: '#fff',
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Controller
              name="subject"
              control={control}
              rules={{ required: 'Subject is required' }}
              render={({ field }) => (
                <FieldSelect
                  label="Subject"
                  value={field.value || ''}
                  error={!!errors.subject}
                  onChange={(v) => {
                    field.onChange(v)
                    setValue('topics', [])
                    setValue('sub_topics', [])
                  }}
                  options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                />
              )}
            />
            <FieldText
              label="Name of Test"
              placeholder="Enter name of Test"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name', { required: 'Test name is required' })}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Controller
              name="topics"
              control={control}
              rules={{
                validate: (v) => (v?.length ? true : 'Select at least one topic'),
              }}
              render={({ field }) => (
                <FieldSelect
                  label="Topic"
                  value={field.value || []}
                  multiple
                  disabled={!selectedSubject}
                  error={!!errors.topics}
                  helperText={errors.topics?.message}
                  onChange={(v) => {
                    field.onChange(v)
                    setValue('sub_topics', [])
                  }}
                  options={topics.map((t) => ({ value: t.id, label: t.name }))}
                />
              )}
            />
            <Controller
              name="sub_topics"
              control={control}
              rules={{
                validate: (v) => (v?.length ? true : 'Select at least one sub topic'),
              }}
              render={({ field }) => (
                <FieldSelect
                  label="Sub Topic"
                  value={field.value || []}
                  multiple
                  disabled={!selectedTopics?.length || subTopics.length === 0}
                  error={!!errors.sub_topics}
                  helperText={errors.sub_topics?.message}
                  onChange={(v) => field.onChange(v)}
                  options={subTopics.map((s) => ({ value: s.id, label: s.name }))}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'start' }}>
            <FieldText
              label="Duration (Minutes)"
              type="number"
              placeholder="Enter the time"
              {...register('total_time', { valueAsNumber: true })}
            />
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Test Difficulty Level
              </Typography>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <RadioGroup row {...field} sx={{ gap: 1 }}>
                      {[
                        { value: 'easy', label: 'Easy' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'hard', label: 'Difficult' },
                      ].map((d) => (
                        <FormControlLabel
                          key={d.value}
                          value={d.value}
                          control={
                            <Radio
                              size="small"
                              sx={{ color: colors.brand500, '&.Mui-checked': { color: colors.brand500 } }}
                            />
                          }
                          label={<Typography variant="body2">{d.label}</Typography>}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </Box>
          </Box>
          <Typography variant="body2" fontWeight={700} sx={{ pb: 1, whiteSpace: 'nowrap' }}>
              Marking Scheme:
            </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'auto repeat(5, minmax(0, 1fr))',
              },
              gap: 2,
              alignItems: 'end',
            }}
          >
            <FieldText
              label="Wrong Answer"
              type="number"
              {...register('wrong_marks', { valueAsNumber: true })}
            />
            <FieldText
              label="Unattempted"
              type="number"
              {...register('unattempt_marks', { valueAsNumber: true })}
            />
            <FieldText
              label="Correct Answer"
              type="number"
              {...register('correct_marks', { valueAsNumber: true })}
            />
            <FieldText
              label="No of Questions"
              type="number"
              placeholder="Ex: 250 Marks"
              {...register('total_questions', { valueAsNumber: true })}
            />
            <FieldText
              label="Total Marks"
              type="number"
              placeholder="Ex: 250 Marks"
              readOnly
              {...register('total_marks', { valueAsNumber: true })}
            />
          </Box>

          <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap" sx={{ pt: 1 }}>
            <Button variant="text" onClick={() => navigate('/dashboard')} sx={{ color: colors.muted }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Next'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}

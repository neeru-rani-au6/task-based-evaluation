import { Box, Chip, Divider, IconButton, Stack, Typography } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import { colors } from '../../theme'
import type { Test } from '../../types'

function prettyType(type?: string) {
  if (type === 'chapterwise') return 'Chapter Wise'
  if (type === 'pyq') return 'PYQ'
  if (type === 'mock') return 'Mock Test'
  return type || 'Chapter Wise'
}

function prettyDifficulty(difficulty?: string) {
  if (difficulty === 'medium') return 'Medium'
  if (difficulty === 'hard') return 'Difficult'
  return 'Easy'
}

const topicChipSx = {
  height: 24,
  fontSize: 12,
  fontWeight: 500,
  borderColor: '#eab308',
  color: '#ca8a04',
  bgcolor: '#fffbeb',
  '& .MuiChip-label': { px: 1.25 },
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 72 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        :
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>{children}</Box>
    </Stack>
  )
}

function StatItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ px: 2, py: 1 }}>
      <Box sx={{ color: colors.muted, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography variant="body2" fontWeight={600} color={colors.ink} sx={{ whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Stack>
  )
}

export default function TestSummaryCard({ test, onEdit }: { test: Test; onEdit?: () => void }) {
  const topics = test.topics?.length ? test.topics : []
  const subTopics = test.sub_topics?.length ? test.sub_topics : []

  return (
    <Box
      sx={{
        border: `1px solid ${colors.line}`,
        borderRadius: 2,
        p: 2.5,
        bgcolor: '#fff',
        position: 'relative',
      }}
    >
      {onEdit && (
        <IconButton
          size="small"
          onClick={onEdit}
          sx={{ position: 'absolute', top: 12, right: 12, color: colors.brand500 }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      )}

      <Chip
        label={prettyType(test.type)}
        size="small"
        sx={{
          bgcolor: '#1e3a5f',
          color: '#fff',
          fontWeight: 600,
          fontSize: 11,
          height: 22,
          borderRadius: 999,
          mb: 1.5,
          '& .MuiChip-label': { px: 1.25 },
        }}
      />

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2, pr: onEdit ? 4 : 0 }}>
        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2, color: colors.ink }}>
          {test.name}
        </Typography>
        <Chip
          icon={<PsychologyOutlinedIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
          label={prettyDifficulty(test.difficulty)}
          size="small"
          sx={{
            bgcolor: '#14b8a6',
            color: '#fff',
            fontWeight: 600,
            height: 24,
            borderRadius: 999,
            '& .MuiChip-icon': { ml: 0.75 },
            '& .MuiChip-label': { px: 1, fontSize: 12 },
          }}
        />
      </Stack>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-end' },
          gap: 2,
        }}
      >
        <Stack spacing={1} sx={{ flex: 1 }}>
          <MetaRow label="Subject">
            <Typography variant="body2" fontWeight={500} color={colors.ink}>
              {test.subject || '—'}
            </Typography>
          </MetaRow>
          <MetaRow label="Topic">
            {topics.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {topics.map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" sx={topicChipSx} />
                ))}
              </Stack>
            )}
          </MetaRow>

          <MetaRow label="Sub Topic">
            {subTopics.length ? (
              subTopics.map((t) => (
                <Chip key={t} label={t} size="small" variant="outlined" sx={topicChipSx} />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            )}
          </MetaRow>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${colors.line}`,
            borderRadius: 999,
            bgcolor: '#fafafa',
            alignSelf: { xs: 'flex-start', sm: 'flex-end' },
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <StatItem icon={<AccessTimeIcon sx={{ fontSize: 18, color: 'inherit' }} />} label={`${test.total_time ?? 0} Min`} />
          <Divider orientation="vertical" flexItem sx={{ borderColor: colors.line }} />
          <StatItem icon={<QuizOutlinedIcon sx={{ fontSize: 18, color: 'inherit' }} />} label={`${test.total_questions ?? 0} Q's`} />
          <Divider orientation="vertical" flexItem sx={{ borderColor: colors.line }} />
          <StatItem icon={<BarChartOutlinedIcon sx={{ fontSize: 18, color: 'inherit' }} />} label={`${test.total_marks ?? 0} Marks`} />
        </Box>
      </Box>
    </Box>
  )
}

import { useState } from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import RemoveIcon from '@mui/icons-material/Remove'
import { colors } from '../../theme'

interface QuestionSidebarProps {
  total: number
  currentIndex: number
  completed: boolean[]
  onSelect: (index: number) => void
}

function IncompleteIcon() {
  return (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: `1.5px solid ${colors.line}`,
        bgcolor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <RemoveIcon sx={{ fontSize: 12, color: colors.muted }} />
    </Box>
  )
}

export default function QuestionSidebar({ total, currentIndex, completed, onSelect }: QuestionSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <Box
        sx={{
          width: 44,
          flexShrink: 0,
          bgcolor: '#fff',
          borderRight: `1px solid ${colors.line}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
          height: '100%',
        }}
      >
        <IconButton size="small" onClick={() => setCollapsed(false)} sx={{ color: colors.muted }}>
          <KeyboardDoubleArrowRightIcon fontSize="small" />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        bgcolor: '#fff',
        borderRight: `1px solid ${colors.line}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${colors.line}` }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Question creation
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Total Questions · {total}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setCollapsed(true)}
            sx={{ color: colors.muted, mt: -0.5, mr: -0.5 }}
            aria-label="Collapse question list"
          >
            <KeyboardDoubleArrowLeftIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Stack
        spacing={0.75}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1.25,
          maxHeight: { md: 'calc(100vh - 64px - 80px)' },
        }}
      >
        {Array.from({ length: total }, (_, i) => {
          const isActive = i === currentIndex
          const isDone = completed[i]

          return (
            <Box
              key={i}
              onClick={() => onSelect(i)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 1,
                borderRadius: 2,
                cursor: 'pointer',
                border: isActive
                  ? `2px solid ${isDone ? '#22c55e' : colors.brand500}`
                  : `1px solid ${isDone ? '#86efac' : colors.line}`,
                bgcolor: isDone ? '#f0fdf4' : '#fff',
                color: isDone ? '#16a34a' : colors.muted,
                fontWeight: isActive ? 600 : 400,
                '&:hover': {
                  bgcolor: isDone ? '#ecfdf5' : '#f9fafb',
                },
              }}
            >
              {isDone ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: '#22c55e', flexShrink: 0 }} />
              ) : (
                <IncompleteIcon />
              )}

              <Typography variant="body2" fontWeight="inherit" color="inherit" sx={{ flex: 1 }}>
                Question {i + 1}
              </Typography>

              <KeyboardDoubleArrowRightIcon
                sx={{
                  fontSize: 16,
                  color: isDone ? '#22c55e' : colors.muted,
                  flexShrink: 0,
                }}
              />
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

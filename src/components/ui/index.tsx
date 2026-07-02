import { Box, Chip, Stack, Typography } from '@mui/material'
import { colors } from '../../theme'
import logoImg from '../../assets/logo.png'

export function Logo({ height = 28 }: { height?: number }) {
  return <Box component="img" src={logoImg} alt="PrepRoute" sx={{ height, width: 'auto' }} />
}

export function StatusBadge({ status }: { status?: string | null }) {
  const label = status || 'draft'
  const isLive = label === 'live'
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        textTransform: 'capitalize',
        fontWeight: 600,
        fontSize: 12,
        bgcolor: isLive ? '#dcfce7' : '#fef3c7',
        color: isLive ? '#166534' : '#92400e',
      }}
    />
  )
}

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: colors.muted, fontSize: 14 }}>
      {items.map((item, i) => (
        <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {i > 0 && <Typography color={colors.line}>/</Typography>}
          <Typography
            sx={{
              color: i === items.length - 1 ? colors.ink : colors.muted,
              fontWeight: i === items.length - 1 ? 600 : 400,
            }}
          >
            {item}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

export function StepTabs({ steps, active }: { steps: string[]; active: number }) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {steps.map((step, i) => (
        <Chip
          key={step}
          label={`${i + 1}. ${step}`}
          sx={{
            fontWeight: 600,
            bgcolor: i === active ? colors.brand50 : 'transparent',
            color: i === active ? colors.brand700 : colors.muted,
            border: i === active ? 'none' : `1px solid ${colors.line}`,
          }}
        />
      ))}
    </Stack>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
      <Box>
        <Typography variant="h5">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  )
}

export function initials(name?: string) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

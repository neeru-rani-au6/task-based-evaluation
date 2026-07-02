import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Logo, initials } from '../ui'
import { colors } from '../../theme'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: 'Test Creation', path: '/tests/create', icon: <EditOutlinedIcon fontSize="small" /> },
  { label: 'Test Tracking', path: '#', icon: <ListAltOutlinedIcon fontSize="small" />, disabled: true },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    if (path === '/tests/create') {
      return location.pathname.startsWith('/tests/create') || location.pathname.includes('/edit') || location.pathname.includes('/questions') || location.pathname.includes('/preview')
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    setMenuAnchor(null)
    logout()
    navigate('/login')
  }

  const sidebar = (onNavigate?: () => void) => (
    <Box sx={{ width: 240, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.line}` }}>
        <Logo height={26} />
      </Box>
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            disabled={item.disabled}
            selected={!item.disabled && isActive(item.path)}
            onClick={() => {
              if (item.disabled) return
              navigate(item.path)
              onNavigate?.()
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1.2,
              '&.Mui-selected': {
                bgcolor: colors.brand50,
                color: colors.brand700,
                '& .MuiListItemIcon-root': { color: colors.brand700 },
              },
              '&.Mui-disabled': { opacity: 0.45 },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: colors.muted }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>
      {!isMobile && (
        <Box sx={{ width: 240, flexShrink: 0, borderRight: `1px solid ${colors.line}`, position: 'sticky', top: 0, height: '100vh' }}>
          {sidebar()}
        </Box>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        {sidebar(() => setDrawerOpen(false))}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          sx={{
            height: 64,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.line}`,
            bgcolor: '#fff',
          }}
        >
          {isMobile ? (
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton size="small">
              <NotificationsNoneOutlinedIcon />
            </IconButton>
            <Box
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                px: 1,
                py: 0.5,
                borderRadius: 2,
                '&:hover': { bgcolor: '#f9fafb' },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: colors.brand500, fontSize: 13 }}>
                {initials(user?.name)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                  {user?.name || user?.userId}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {user?.role || 'Admin'}
                </Typography>
              </Box>
              <KeyboardArrowDownIcon fontSize="small" sx={{ color: colors.muted }} />
            </Box>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem onClick={handleLogout}>Log out</MenuItem>
            </Menu>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: location.pathname.includes('/questions') || location.pathname.includes('/preview') ? 0 : { xs: 2, md: 3 },
            overflow: 'auto',
            bgcolor: location.pathname.includes('/questions') || location.pathname.includes('/preview') ? colors.canvas : 'transparent',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

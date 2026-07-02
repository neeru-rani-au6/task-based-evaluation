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
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useAppDispatch, useTestFlow } from '../../store/hooks'
import { fetchTests, clearTests } from '../../store/slices/testsSlice'
import { Logo, initials } from '../ui'
import { colors } from '../../theme'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: 'Test Creation', path: '/tests/create', icon: <EditOutlinedIcon fontSize="small" /> },
  { label: 'Test Tracking', path: '#', icon: <ListAltOutlinedIcon fontSize="small" />, disabled: true },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const dispatch = useAppDispatch()
  const { clearTestFlow } = useTestFlow()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchor)

  useEffect(() => {
    dispatch(fetchTests())
  }, [dispatch])

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
    dispatch(clearTests())
    clearTestFlow()
    navigate('/login')
  }

  const toggleProfileMenu = (e: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(menuOpen ? null : e.currentTarget)
  }

  const isFullBleedPage =
    location.pathname.includes('/questions') || location.pathname.includes('/preview')

  const navList = (onNavigate?: () => void) => (
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
            py: 1.1,
            px: 1.5,
            alignItems: 'center',
            '&.Mui-selected': {
              bgcolor: colors.brand50,
              color: colors.brand700,
              '& .MuiListItemIcon-root': { color: colors.brand700 },
            },
            '&.Mui-disabled': { opacity: 0.45 },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: colors.muted }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
        </ListItemButton>
      ))}
    </List>
  )

  const profileSection = (
    <>
      <IconButton size="small">
        <NotificationsNoneOutlinedIcon />
      </IconButton>
      <Box
        onClick={toggleProfileMenu}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          px: 1,
          py: 0.5,
          borderRadius: 2,
          // bgcolor: menuOpen ? '#f9fafb' : 'transparent',
          // '&:hover': { bgcolor: '#f9fafb' },
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
        {menuOpen ? (
          <KeyboardArrowUpIcon fontSize="small" sx={{ color: colors.muted }} />
        ) : (
          <KeyboardArrowDownIcon fontSize="small" sx={{ color: colors.muted }} />
        )}
      </Box>
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 0.75,
              minWidth: 150,
              borderRadius: 2,
              border: `1px solid ${colors.line}`,
            },
          },
        }}
        sx={{ zIndex: 1400 }}
      >
        <MenuItem onClick={handleLogout} sx={{ fontSize: 14, py: 1.25 }}>
          Log out
        </MenuItem>
      </Menu>
    </>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: '#fafafa' }}>
      {/* Top navbar — logo always here */}
      <Box
        component="header"
        sx={{
          height: 64,
          px: { xs: 2, md: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${colors.line}`,
          bgcolor: '#fff',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 1200,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(true)} aria-label="Open menu" edge="start">
              <MenuIcon />
            </IconButton>
          )}
          <Logo height={isMobile ? 24 : 26} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>{profileSection}</Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {!isMobile && (
          <Box
            sx={{
              width: 240,
              flexShrink: 0,
              borderRight: `1px solid ${colors.line}`,
              bgcolor: '#fff',
            }}
          >
            {navList()}
          </Box>
        )}

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: 260 } }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>
            <Box
              sx={{
                height: 64,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${colors.line}`,
                flexShrink: 0,
              }}
            >
              <Logo height={24} />
              <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <CloseIcon />
              </IconButton>
            </Box>
            {navList(() => setDrawerOpen(false))}
          </Box>
        </Drawer>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: isFullBleedPage ? 'hidden' : 'auto',
            display: isFullBleedPage ? 'flex' : 'block',
            flexDirection: isFullBleedPage ? 'column' : undefined,
            p: isFullBleedPage ? 0 : { xs: 2, md: 3 },
            bgcolor: isFullBleedPage ? colors.canvas : 'transparent',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

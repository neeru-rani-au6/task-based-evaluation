import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { login as loginApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../ui'
import { colors } from '../../theme'
import { parseApiError, parseApiErrorBody } from '../../utils/apiError'

interface LoginForm {
  userId: string
  password: string
}

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setError('')
    setLoading(true)
    try {
      const res = await loginApi(data.userId, data.password)
      if (res.data.status === 'success') {
        login(res.data.data.token, res.data.data.user)
        navigate('/dashboard')
      } else {
        setError(parseApiErrorBody(res.data, 'Login failed'))
      }
    } catch (err: unknown) {
      setError(parseApiError(err, 'Invalid credentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          bgcolor: colors.brand50,
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
        }}
      >
        <Box component="img" src="/auth.png" alt="" sx={{ maxWidth: 420, width: '100%' }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
          bgcolor: '#fff',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Logo height={32} />

          <Typography variant="h4" sx={{ mt: 4, mb: 0.5 }}>
            Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use your company provided Login credentials
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  User ID
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter user ID"
                  size="small"
                  error={!!errors.userId}
                  helperText={errors.userId?.message}
                  {...register('userId', { required: 'User ID is required' })}
                />
              </Box>

              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter password"
                  size="small"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register('password', { required: 'Password is required' })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setShowPassword((v) => !v)} size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Link href="#" underline="hover" sx={{ color: colors.brand600, fontSize: 14, fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </Box>

              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage

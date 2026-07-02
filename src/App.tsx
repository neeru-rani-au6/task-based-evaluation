import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TestProvider } from './context/TestContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './components/login/login'
import DashboardPage from './pages/Dashboard'
import CreateTestPage from './pages/CreateTest'
import AddQuestionsPage from './pages/AddQuestions'
import PreviewPublishPage from './pages/PreviewPublish'
import { theme } from './theme'

function LoginRedirect() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <LoginPage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRedirect />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tests/create" element={<CreateTestPage />} />
        <Route path="/tests/:id/edit" element={<CreateTestPage />} />
        <Route path="/tests/:id/questions" element={<AddQuestionsPage />} />
        <Route path="/tests/:id/preview" element={<PreviewPublishPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TestProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TestProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

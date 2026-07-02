import { createTheme } from '@mui/material'

export const colors = {
  brand50: '#eef0fe',
  brand100: '#dde1fd',
  brand500: '#5b6cf5',
  brand600: '#4754d6',
  brand700: '#3a45ad',
  ink: '#1f2733',
  muted: '#6b7280',
  line: '#e5e7eb',
  canvas: '#f5f7ff',
}

export const theme = createTheme({
  palette: {
    primary: { main: colors.brand500, dark: colors.brand600, light: colors.brand100 },
    text: { primary: colors.ink, secondary: colors.muted },
    background: { default: '#ffffff', paper: '#ffffff' },
    divider: colors.line,
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, color: colors.ink },
    h5: { fontWeight: 700, color: colors.ink },
    h6: { fontWeight: 600, color: colors.ink },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8, boxShadow: 'none' },
        containedPrimary: {
          backgroundColor: colors.brand500,
          '&:hover': { backgroundColor: colors.brand600, boxShadow: 'none' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#fff',
          '& fieldset': { borderColor: colors.line },
          '&:hover fieldset': { borderColor: colors.brand500 },
          '&.Mui-focused fieldset': { borderColor: colors.brand500 },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
})

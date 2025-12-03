// lib/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f', // Rojo Santa
      contrastText: '#fff',
    },
    secondary: {
      main: '#2e7d32', // Verde Navidad
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'var(--font-roboto)', // Opcional si usas next/font
  },
});
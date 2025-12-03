'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  palette: {
    primary: {
      main: '#6A1B9A', // Xtrim Purple
      light: '#9c4dcc',
      dark: '#38006b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8E24AA', // Violet Accent (Para botones de acción secundaria)
      light: '#c158dc',
      dark: '#5c007a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F5F5', // Un gris muy suave para que resalte el morado
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111111', // Almost Black
      secondary: '#757575', // Medium Gray
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#4A148C', // Deep Purple para el Navbar
          color: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Sombra suave
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
          paddingTop: 10,
          paddingBottom: 10,
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #6A1B9A 30%, #8E24AA 90%)', // Gradiente Xtrim
          boxShadow: '0 3px 5px 2px rgba(106, 27, 154, .3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label.Mui-focused': { color: '#6A1B9A' },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': { borderColor: '#6A1B9A' },
          },
        },
      },
    },
  },
});

export default theme;
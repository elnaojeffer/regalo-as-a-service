// app/mui-provider.tsx
'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme'; // Ajusta la ruta si es necesario

export default function MUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline resetea el CSS global al estilo Material */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
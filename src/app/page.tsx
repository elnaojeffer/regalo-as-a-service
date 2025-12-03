// app/page.tsx
'use client';

import { 
  Box, Card, CardContent, TextField, Button, 
  Typography, Link, Container 
} from '@mui/material';
import { useRouter } from 'next/navigation'; // Hook de navegación de Next.js

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Aquí iría tu lógica real de autenticación (Supabase)
    // Por ahora, redirigimos al dashboard al hacer clic
    router.push('/dashboard');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f2f5 0%, #e3e8ee 100%)'
      }}
    >
      <Container maxWidth="xs">
        <Card elevation={4} sx={{ p: 2, width: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'center' }}>
            
            <Box>
              <Typography variant="h4" color="primary" fontWeight="bold">Santa Deploy 🎅</Typography>
              <Typography variant="body2" color="text.secondary">
                Conectando UIO & GYE con alegría
              </Typography>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal" required fullWidth
                label="Correo Electrónico"
                name="email" autoFocus
                color="primary"
              />
              <TextField
                margin="normal" required fullWidth
                label="Contraseña" type="password"
                name="password"
                color="primary"
              />

              <Button
                onClick={handleLogin}
                fullWidth variant="contained" size="large"
                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
              >
                Ingresar
              </Button>
              
              <Box sx={{ mt: 1 }}>
                <Link href="#" underline="hover" color="primary" variant="body2">
                  ¿No tienes cuenta? Regístrate aquí
                </Link>
              </Box>
            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
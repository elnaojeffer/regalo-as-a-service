"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { validarCedula } from "@/lib/utils";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
  MenuItem,
  Collapse,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  Login,
  Badge,
  CloudQueue,
} from "@mui/icons-material";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Estado para evitar el "flash" del login
  const [checkingSession, setCheckingSession] = useState(true);

  // Estado para solucionar el error de Hidratación
  const [mounted, setMounted] = useState(false);

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [sede, setSede] = useState("UIO");
  const [cedula, setCedula] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1. VERIFICAR SESIÓN
  useEffect(() => {
    setMounted(true);

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn("Sesión inválida, limpiando...", error.message);
          await supabase.auth.signOut();
          setCheckingSession(false);
          return;
        }

        if (data.session) {
          router.replace("/dashboard");
        } else {
          setCheckingSession(false);
        }
      } catch (err) {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 10) setCedula(value);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        // --- VALIDACIÓN ---
        if (!fullName.trim() || fullName.length < 3) {
          throw new Error("Por favor, ingresa tu nombre completo.");
        }
        if (!validarCedula(cedula)) {
          throw new Error("La cédula ingresada no es válida.");
        }

        // --- REGISTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, sede: sede, cedula: cedula },
            // Aunque la confirmación esté off, esto asegura el flujo correcto
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          if (error.message.includes("unique") || error.status === 422) {
            throw new Error("Esta cédula o correo ya están registrados.");
          }
          throw error;
        }

        // --- CAMBIO: REDIRECCIÓN DIRECTA (Sin mensaje de correo) ---
        // Al estar deshabilitada la confirmación, signUp crea la sesión automáticamente.
        router.push("/dashboard");
      } else {
        // --- INICIO DE SESIÓN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  if (!mounted) return null;

  if (checkingSession) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f0f2f5",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card
          elevation={10}
          sx={{
            p: 3,
            width: "100%",
            borderRadius: 6,
            bgcolor: "rgba(255, 255, 255, 0.98)",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              textAlign: "center",
            }}
          >
            {/* Header con Santa */}
            <Box mb={1}>
              <Typography
                variant="h2"
                sx={{ mb: 1, animation: "bounce 2s infinite" }}
              >
                🎅
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                RaaS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isRegistering
                  ? "Únete al intercambio"
                  : "Regalos as a Service - Xtrim"}
              </Typography>
            </Box>

            {/* Formulario */}
            <Box
              component="form"
              onSubmit={handleAuth}
              noValidate
              sx={{ mt: 1 }}
            >
              <Collapse in={isRegistering}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <TextField
                    required={isRegistering}
                    fullWidth
                    label="Nombre Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    size="small"
                  />

                  <TextField
                    required={isRegistering}
                    fullWidth
                    label="Cédula / DNI"
                    placeholder="10 dígitos"
                    value={cedula}
                    onChange={handleCedulaChange}
                    size="small"
                    error={cedula.length === 10 && !validarCedula(cedula)}
                    helperText={
                      cedula.length === 10 && !validarCedula(cedula)
                        ? "Cédula inválida"
                        : ""
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    select
                    required={isRegistering}
                    fullWidth
                    label="Sede"
                    value={sede}
                    onChange={(e) => setSede(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="UIO">Quito (UIO)</MenuItem>
                    <MenuItem value="GYE">Guayaquil (GYE)</MenuItem>
                  </TextField>
                </Box>
              </Collapse>

              <TextField
                margin="normal"
                required
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={
                  loading ? null : isRegistering ? <PersonAdd /> : <Login />
                }
                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isRegistering ? (
                  "Crear Cuenta"
                ) : (
                  "Ingresar"
                )}
              </Button>

              <Box sx={{ mt: 1 }}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  underline="hover"
                  variant="body2"
                  sx={{ cursor: "pointer", color: "primary.main" }}
                >
                  {isRegistering
                    ? "¿Ya tienes cuenta? Inicia sesión aquí"
                    : "¿No tienes cuenta? Regístrate aquí"}
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

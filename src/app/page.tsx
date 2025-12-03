"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { validarCedula } from "@/lib/utils"; // ⚠️ Asegúrate de tener este archivo
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
  Badge, // Icono para la cédula
} from "@mui/icons-material";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [sede, setSede] = useState("UIO");
  const [cedula, setCedula] = useState(""); // <--- NUEVO
  const [showPassword, setShowPassword] = useState(false);

  // Helper para solo números en la cédula
  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Solo permite números
    if (value.length <= 10) setCedula(value);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        // --- VALIDACIÓN CÉDULA ---
        if (!validarCedula(cedula)) {
          throw new Error("La cédula ingresada no es válida.");
        }

        // --- LÓGICA DE REGISTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Enviamos la cédula también
            data: { full_name: fullName, sede: sede, cedula: cedula },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          // Detectar duplicados de cédula
          if (error.message.includes("unique") || error.status === 422) {
            throw new Error("Esta cédula o correo ya están registrados.");
          }
          throw error;
        }

        alert("¡Cuenta creada! Revisa tu correo o inicia sesión.");
        setIsRegistering(false);
      } else {
        // --- LÓGICA DE LOGIN ---
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f2f5 0%, #e3e8ee 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card elevation={4} sx={{ p: 2, width: "100%", borderRadius: 4 }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              textAlign: "center",
            }}
          >
            <Box mb={1}>
              <Typography
                variant="h2"
                sx={{ mb: 1, animation: "bounce 2s infinite" }}
              >
                🎅
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                Regalo as a Service
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isRegistering
                  ? "Únete al intercambio"
                  : "Conectando a Xtrim UIO & GYE"}
              </Typography>
            </Box>

            {/* FORMULARIO */}
            <Box
              component="form"
              onSubmit={handleAuth}
              noValidate
              sx={{ mt: 1 }}
            >
              {/* CAMPOS SOLO PARA REGISTRO */}
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

                  {/* --- CAMPO CÉDULA NUEVO --- */}
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge fontSize="small" color="action" />
                        </InputAdornment>
                      ),
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
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

              {/* TOGGLE LINK */}
              <Box sx={{ mt: 1 }}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  underline="hover"
                  variant="body2"
                  sx={{ cursor: "pointer" }}
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

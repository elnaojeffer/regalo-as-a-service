"use client";
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; // Varita mágica
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const handleRunSorteo = async () => {
    if (!confirm("⚠️ ¿ESTÁS SEGURO? Esto enviará los correos a todos.")) return;

    setLoading(true);
    setLogs([]);

    try {
      const response = await fetch("/api/sorteo", {
        method: "POST",
        headers: {
          // Recuerda: En producción real esto no debe ir hardcodeado o prompt
          "x-admin-secret":
            prompt("Ingresa la SERVICE ROLE KEY para autorizar:") || "",
        },
      });

      const data = await response.json();
      setLogs(data.matches || []);

      if (!response.ok) alert("Error: " + (data.error || "Desconocido"));
      else alert("¡Sorteo realizado con éxito! 🎅");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a237e 0%, #311b92 100%)", // Gradiente oscuro elegante
        py: 8,
        color: "white",
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Box
            sx={{
              display: "inline-flex",
              p: 2,
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              mb: 2,
            }}
          >
            <Typography variant="h2">🎅</Typography>
          </Box>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{ mb: 1, textShadow: "0px 4px 20px rgba(0,0,0,0.5)" }}
          >
            Panel de Administración
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
            Sistema de Sorteo Navideño Xtrim
          </Typography>
        </Box>

        <Card
          elevation={12}
          sx={{ bgcolor: "rgba(255, 255, 255, 0.95)", mb: 4 }}
        >
          <CardContent sx={{ p: 4 }}>
            <Alert
              severity="warning"
              icon={<WarningAmberIcon fontSize="inherit" />}
              sx={{ mb: 4, borderRadius: 2 }}
            >
              <strong>Zona de Peligro:</strong> Ejecuta el sorteo solo cuando
              todos los participantes hayan completado su registro (Viernes).
            </Alert>

            <Button
              onClick={handleRunSorteo}
              disabled={loading}
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              startIcon={loading ? null : <AutoFixHighIcon />}
              sx={{
                py: 2,
                fontSize: "1.2rem",
                boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
                background: "linear-gradient(45deg, #7b1fa2 30%, #512da8 90%)",
              }}
            >
              {loading
                ? "✨ Ejecutando Sorteo..."
                : "Ejecutar Sorteo y Enviar Emails"}
            </Button>
          </CardContent>
        </Card>

        {logs.length > 0 && (
          <Box sx={{ animation: "fadeIn 0.5s ease-in" }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h5" fontWeight="bold">
                📋 Log de Resultados
              </Typography>
              <Chip label={`${logs.length} asignaciones`} color="success" />
            </Box>

            <Paper
              elevation={4}
              sx={{
                maxHeight: 500,
                overflow: "auto",
                bgcolor: "#212121",
                color: "white",
                borderRadius: 2,
              }}
            >
              <List>
                {logs.map((log, i) => (
                  <div key={i}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            flexWrap="wrap"
                          >
                            <Typography color="success.light" fontWeight="bold">
                              🎅 {log.santa}
                            </Typography>
                            <ArrowForwardIcon
                              sx={{ color: "grey.500", fontSize: 16 }}
                            />
                            <Typography color="warning.light" fontWeight="bold">
                              🎁 {log.recipient}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        size="small"
                        icon={
                          log.emailStatus === "Sent" ? (
                            <CheckCircleIcon />
                          ) : (
                            <ErrorIcon />
                          )
                        }
                        label={log.emailStatus}
                        color={log.emailStatus === "Sent" ? "success" : "error"}
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "white",
                        }}
                      />
                    </ListItem>
                    {i < logs.length - 1 && (
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                    )}
                  </div>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}

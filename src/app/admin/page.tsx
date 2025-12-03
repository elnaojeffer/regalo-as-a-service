"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  AutoFixHigh,
  WarningAmber,
  ArrowForward,
  Security,
  AdminPanelSettings,
} from "@mui/icons-material";

const ADMIN_EMAIL = "jpalmacoloma@gmail.com";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);

  // 1. Verificación de Seguridad (Client Side)
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        // Si no es el admin, lo sacamos
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  // 2. Cargar datos
  useEffect(() => {
    const fetchMatches = async () => {
      console.log("Iniciando fetch de matches...");

      // Intentamos traer los datos
      const { data, error } = await supabase.from("matches").select(`
          id,
          created_at,
          santa:santa_id ( full_name ),
          recipient:recipient_id ( full_name )
        `);

      if (error) {
        console.error("❌ Error de Supabase:", error.message);
        alert("Error cargando tabla: " + error.message);
      }

      if (data) {
        console.log("✅ Datos recibidos:", data);
        setMatches(data);
      }

      setFetching(false);
    };

    fetchMatches();
  }, []);

  const handleRunSorteo = async () => {
    if (
      !confirm(
        "⚠️ ¿ESTÁS SEGURO? Esto generará nuevos pares y enviará correos."
      )
    )
      return;
    setLoading(true);
    try {
      const response = await fetch("/api/sorteo", {
        method: "POST",
        headers: {
          "x-admin-secret": prompt("Ingresa la SERVICE ROLE KEY:") || "",
        },
      });
      const data = await response.json();
      if (!response.ok) alert("Error: " + (data.error || "Desconocido"));
      else {
        alert("¡Sorteo realizado! Recargando...");
        window.location.reload();
      }
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
        background:
          "radial-gradient(circle at 50% -20%, #4A148C 0%, #121212 60%)",
        color: "white",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        {/* HEADER */}
        <Box textAlign="center" mb={6}>
          <Chip
            icon={<AdminPanelSettings />}
            label="ADMINISTRATOR MODE"
            sx={{
              bgcolor: "#FFD700",
              color: "#000",
              fontWeight: "bold",
              mb: 2,
            }}
          />
          <Typography variant="h3" fontWeight="bold">
            Panel RaaS
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "gray" }}>
            {ADMIN_EMAIL}
          </Typography>
        </Box>

        {/* ACTION CARD */}
        <Card
          sx={{
            bgcolor: "rgba(30, 30, 30, 0.9)",
            border: "1px solid #333",
            mb: 6,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" gap={2} mb={3}>
              <WarningAmber color="warning" sx={{ fontSize: 30 }} />
              <Box>
                <Typography variant="h6" color="white" fontWeight="bold">
                  Ejecutar Sorteo
                </Typography>
                <Typography variant="body2" color="gray">
                  Acción irreversible. Asigna pares y envía correos.
                </Typography>
              </Box>
            </Stack>
            <Button
              onClick={handleRunSorteo}
              disabled={loading}
              fullWidth
              variant="contained"
              size="large"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AutoFixHigh />
                )
              }
              sx={{
                py: 2,
                bgcolor: "#D32F2F",
                "&:hover": { bgcolor: "#B71C1C" },
              }}
            >
              {loading ? "Procesando..." : "EJECUTAR SORTEO"}
            </Button>
          </CardContent>
        </Card>

        {/* LOGS */}
        <Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Security color="secondary" /> Asignaciones
            </Typography>
            <Chip
              label={`${matches.length} Registros`}
              color="secondary"
              variant="outlined"
            />
          </Box>

          {fetching ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress color="secondary" />
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                maxHeight: 600,
                overflow: "auto",
                bgcolor: "rgba(0,0,0,0.4)",
                border: "1px solid #333",
              }}
            >
              <List>
                {matches.map((match, i) => {
                  // PROTECCIÓN CONTRA CRASHES:
                  // Usamos ?. para acceder de forma segura. Si es null/undefined, devuelve undefined y usamos || para poner texto.
                  // TypeScript a veces se queja de que 'santa' es array o objeto, casteamos a any para evitar lios rápidos.
                  const santaName =
                    (match.santa as any)?.full_name || "Desconocido (ID Error)";
                  const recipientName =
                    (match.recipient as any)?.full_name ||
                    "Desconocido (ID Error)";

                  return (
                    <div key={match.id}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemText
                          primary={
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={2}
                              flexWrap="wrap"
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="gray">
                                  SANTA
                                </Typography>
                                <Typography color="#A5D6A7" fontWeight="bold">
                                  {santaName}
                                </Typography>
                              </Box>
                              <ArrowForward sx={{ color: "gray" }} />
                              <Box sx={{ flex: 1, textAlign: "right" }}>
                                <Typography variant="caption" color="gray">
                                  RECIBE
                                </Typography>
                                <Typography color="#FFCC80" fontWeight="bold">
                                  {recipientName}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {i < matches.length - 1 && (
                        <Divider
                          sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </List>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
}

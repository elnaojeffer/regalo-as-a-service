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
  TextField,
} from "@mui/material";
// ✅ CORRECCIÓN: Usamos Grid v2 explícitamente
import Grid from "@mui/material/Grid";
import {
  AutoFixHigh,
  WarningAmber,
  ArrowForward,
  Security,
  AdminPanelSettings,
  Save,
  AccessTime,
} from "@mui/icons-material";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");

  // Estados para el formulario de configuración
  const [formDateSorteo, setFormDateSorteo] = useState("");
  const [formDateIntercambio, setFormDateIntercambio] = useState("");
  const [formAdminEmail, setFormAdminEmail] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  // 1. SEGURIDAD Y CARGA
  useEffect(() => {
    const init = async () => {
      // A. Verificar usuario actual
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        router.push("/");
        return;
      }

      // B. Traer configuración real
      const { data: configData } = await supabase.from("config").select("*");

      let realAdminEmail = "";
      if (configData) {
        const adminCfg = configData.find((c) => c.key === "admin_email");
        const sorteoCfg = configData.find((c) => c.key === "fecha_sorteo");
        const intercambioCfg = configData.find(
          (c) => c.key === "fecha_intercambio"
        );

        if (adminCfg) {
          realAdminEmail = adminCfg.value;
          setFormAdminEmail(adminCfg.value);
        }
        if (sorteoCfg) setFormDateSorteo(sorteoCfg.value);
        if (intercambioCfg) setFormDateIntercambio(intercambioCfg.value);
      }

      setCurrentAdminEmail(realAdminEmail || "No configurado");

      // C. Validar acceso
      if (user.email !== realAdminEmail) {
        router.push("/dashboard");
        return;
      }

      // D. Cargar logs
      fetchMatches();
    };

    init();
  }, [router]);

  const fetchMatches = async () => {
    const { data } = await supabase.from("matches").select(`
          id, created_at,
          santa:santa_id ( full_name ),
          recipient:recipient_id ( full_name )
        `);
    if (data) setMatches(data);
    setFetching(false);
  };

  // Guardar Configuración en BD
  const handleSaveConfig = async () => {
    if (!confirm("¿Actualizar la configuración del sistema?")) return;
    setSavingConfig(true);

    const updates = [
      { key: "admin_email", value: formAdminEmail },
      { key: "fecha_sorteo", value: formDateSorteo },
      { key: "fecha_intercambio", value: formDateIntercambio },
    ];

    const { error } = await supabase.from("config").upsert(updates);

    if (error) alert("Error al guardar: " + error.message);
    else {
      alert("¡Configuración actualizada!");
      setCurrentAdminEmail(formAdminEmail);
      window.location.reload();
    }
    setSavingConfig(false);
  };

  const handleRunSorteo = async () => {
    if (!confirm("⚠️ ¿Ejecutar sorteo? Se enviarán correos a todos.")) return;
    setLoading(true);
    try {
      const response = await fetch("/api/sorteo", {
        method: "POST",
        headers: {
          "x-admin-secret": prompt("Clave Maestra (Service Role):") || "",
        },
      });
      const data = await response.json();
      if (!response.ok) alert("Error: " + (data.error || "Desconocido"));
      else {
        alert("¡Sorteo exitoso!");
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
            label="ADMIN MODE"
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
            Admin: <span style={{ color: "#E1BEE7" }}>{currentAdminEmail}</span>
          </Typography>
        </Box>

        {/* 1. CONFIGURACIÓN DEL SISTEMA */}
        <Card
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid #444",
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" gap={2} mb={3}>
              <AccessTime sx={{ color: "#E1BEE7", fontSize: 30 }} />
              <Typography variant="h6" color="white" fontWeight="bold">
                Configuración del Evento
              </Typography>
            </Stack>

            {/* ✅ CORRECCIÓN: Grid V2 */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Correo del Administrador"
                  variant="filled"
                  value={formAdminEmail}
                  onChange={(e) => setFormAdminEmail(e.target.value)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    input: { color: "white" },
                    label: { color: "gray" },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Fecha Sorteo (ISO)"
                  variant="filled"
                  placeholder="2025-12-05T15:00:00"
                  value={formDateSorteo}
                  onChange={(e) => setFormDateSorteo(e.target.value)}
                  helperText="Formato: YYYY-MM-DDTHH:MM:SS"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    input: { color: "white" },
                    label: { color: "gray" },
                    ".MuiFormHelperText-root": { color: "gray" },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Fecha Intercambio (ISO)"
                  variant="filled"
                  placeholder="2025-12-23T14:00:00"
                  value={formDateIntercambio}
                  onChange={(e) => setFormDateIntercambio(e.target.value)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    input: { color: "white" },
                    label: { color: "gray" },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  variant="contained"
                  fullWidth
                  startIcon={<Save />}
                  sx={{ bgcolor: "#7B1FA2", "&:hover": { bgcolor: "#4A148C" } }}
                >
                  {savingConfig ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 2. ZONA DE SORTEO */}
        <Card
          sx={{
            bgcolor: "rgba(30, 30, 30, 0.9)",
            border: "1px solid #D32F2F",
            mb: 6,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" gap={2} mb={3}>
              <WarningAmber color="error" sx={{ fontSize: 30 }} />
              <Box>
                <Typography variant="h6" color="white" fontWeight="bold">
                  Ejecutar Sorteo
                </Typography>
                <Typography variant="body2" color="gray">
                  Acción irreversible. Asigna pares y envía correos masivos.
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
              {loading ? "Procesando..." : "EJECUTAR ALGORITMO"}
            </Button>
          </CardContent>
        </Card>

        {/* 3. LOGS */}
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              <Security
                color="secondary"
                sx={{ mr: 1, verticalAlign: "bottom" }}
              />{" "}
              Asignaciones
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
                {matches.map((m, i) => (
                  <div key={m.id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box flex={1}>
                              <Typography variant="caption" color="gray">
                                SANTA
                              </Typography>
                              <Typography color="#A5D6A7" fontWeight="bold">
                                {(m.santa as any)?.full_name || "?"}
                              </Typography>
                            </Box>
                            <ArrowForward sx={{ color: "gray" }} />
                            <Box flex={1} textAlign="right">
                              <Typography variant="caption" color="gray">
                                RECIBE
                              </Typography>
                              <Typography color="#FFCC80" fontWeight="bold">
                                {(m.recipient as any)?.full_name || "?"}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {i < matches.length - 1 && (
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                    )}
                  </div>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
}

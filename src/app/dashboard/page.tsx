"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  AppBar,
  Toolbar,
  Avatar,
  Paper,
  Stack,
  Button,
} from "@mui/material";
// IMPORTANTE: Usamos Grid2 para la nueva versión
import Grid from "@mui/material/Grid";
import {
  ExpandMore,
  Delete,
  AddCircle,
  CardGiftcard,
  Logout,
  LocationOn,
  CloudQueue,
  AccessTime,
  Settings,
} from "@mui/icons-material";
import confetti from "canvas-confetti";
import { CircularProgress } from "@mui/material";
// --- FECHA DEL SORTEO ---
// Ajusta el año y mes (Recuerda: en JS los meses van de 0 a 11. Dic es 11)
const TARGET_DATE = new Date(2025, 11, 23, 14, 0, 0); // 23 de Diciembre, 14:00

// --- Interfaces ---
interface WishItem {
  id: number;
  description: string;
  user_id: string;
  profiles: { full_name: string; sede: string };
  created_at: string;
}

interface GroupedWishes {
  [userId: string]: {
    name: string;
    sede: string;
    wishes: WishItem[];
  };
}
const ADMIN_EMAIL = "jpalmacoloma@gmail.com"; // Tu correo
export default function DashboardPage() {
  const router = useRouter();
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [newWish, setNewWish] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // 👈 NUEVO

  // State del Contador
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  // 👇 Evitar hidratación con mounted
  useEffect(() => {
    setMounted(true);
  }, []);
  // --- Carga de Datos y Timer ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. Verificamos sesión PRIMERO
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Si no hay sesión, redirigimos y NO cargamos nada más
          router.replace("/");
          return;
        }

        // 2. Si hay sesión, seteamos usuario y cargamos deseos
        setCurrentUser(session.user);
        await fetchWishes();

        // 3. Finalmente quitamos el loading
        setLoading(false);
      } catch (error) {
        router.replace("/");
      }
    };

    checkSession();

    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    if (!mounted) return;

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  // --- Lógica del Contador ---
  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = TARGET_DATE.getTime() - now.getTime();

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const fetchWishes = async () => {
    const { data } = await supabase
      .from("wishes")
      .select("*, profiles(full_name, sede)")
      .order("created_at", { ascending: false });
    if (data) setWishes(data);
  };

  // --- Lógica de Negocio ---
  const handleAddWish = async () => {
    if (!newWish.trim() || !currentUser) return;

    const myCount = wishes.filter((w) => w.user_id === currentUser.id).length;
    if (myCount >= 3) {
      alert("¡Ya tienes 3 deseos! Borra uno si quieres cambiarlo.");
      return;
    }

    const { error } = await supabase.from("wishes").insert({
      user_id: currentUser.id,
      description: newWish,
    });

    if (!error) {
      setNewWish("");
      await fetchWishes();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      alert(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Borrar este deseo?")) return;
    setWishes((prev) => prev.filter((w) => w.id !== id));
    await supabase.from("wishes").delete().eq("id", id);
    fetchWishes();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // --- Agrupación de Datos ---
  const myWishes = useMemo(() => {
    return wishes.filter((w) => w.user_id === currentUser?.id);
  }, [wishes, currentUser]);

  const groupedOtherWishes = useMemo(() => {
    const groups: GroupedWishes = {};
    wishes.forEach((wish) => {
      if (!groups[wish.user_id]) {
        groups[wish.user_id] = {
          name: wish.profiles.full_name,
          sede: wish.profiles.sede,
          wishes: [],
        };
      }
      groups[wish.user_id].wishes.push(wish);
    });
    return Object.values(groups);
  }, [wishes, currentUser]);

  // Componente para cuadritos de tiempo
  const TimeBox = ({ val, label }: { val: number; label: string }) => (
    <Box textAlign="center" mx={1}>
      <Paper
        elevation={3}
        sx={{
          minWidth: 60,
          py: 1,
          bgcolor: "primary.main",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {String(val).padStart(2, "0")}
        </Typography>
      </Paper>
      <Typography
        variant="caption"
        sx={{
          mt: 0.5,
          display: "block",
          fontWeight: "bold",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  if (loading || !mounted) {
    // 👈 Agregado !mounted
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f4f6f8",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      {/* NAVBAR */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <CloudQueue sx={{ mr: 2, color: "#fff" }} />
          <Box flexGrow={1}>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
              RaaS
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Regalos as a Service
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              mr: 2,
              display: { xs: "none", sm: "block" },
              fontWeight: 500,
            }}
          >
            {currentUser?.user_metadata?.full_name}
          </Typography>

          {/* --- BOTÓN DE ADMIN (Solo visible para ti) --- */}
          {currentUser?.email === ADMIN_EMAIL && (
            <Button
              onClick={() => router.push("/admin")}
              startIcon={<Settings />}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                mr: 1,
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
              variant="outlined"
              size="small"
            >
              Admin
            </Button>
          )}

          <IconButton onClick={handleLogout} sx={{ color: "white" }}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
        {/* --- SECCIÓN CONTADOR --- */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <AccessTime fontSize="small" /> Tiempo para el Sorteo
          </Typography>
          <Box display="flex" justifyContent="center">
            <TimeBox val={timeLeft.days} label="DÍAS" />
            <TimeBox val={timeLeft.hours} label="HRS" />
            <TimeBox val={timeLeft.minutes} label="MIN" />
            <TimeBox val={timeLeft.seconds} label="SEG" />
          </Box>
        </Box>

        {/* --- GRID V2 SYSTEM --- */}
        <Grid container spacing={4}>
          {/* --- COLUMNA IZQUIERDA: MI CARTA --- */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: "sticky", top: 100, transition: "top 0.3s" }}>
              <Card elevation={4} sx={{ borderRadius: 4, overflow: "visible" }}>
                {/* Header decorativo de la tarjeta */}
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    height: 8,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Mi Carta 📜
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={0.5}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Progreso
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {myWishes.length}/3
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(myWishes.length / 3) * 100}
                      color={myWishes.length === 3 ? "success" : "primary"}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Input condicional */}
                  {myWishes.length < 3 ? (
                    <Box display="flex" gap={1} mb={3}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Escribe un deseo..."
                        value={newWish}
                        onChange={(e) => setNewWish(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddWish()}
                      />
                      <IconButton
                        color="primary"
                        onClick={handleAddWish}
                        disabled={!newWish.trim()}
                        sx={{
                          bgcolor: "primary.light",
                          color: "white",
                          "&:hover": { bgcolor: "primary.main" },
                        }}
                      >
                        <AddCircle />
                      </IconButton>
                    </Box>
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        bgcolor: "#e8f5e9",
                        border: "1px solid #c8e6c9",
                        p: 2,
                        borderRadius: 2,
                        mb: 3,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="success.dark"
                        fontWeight="bold"
                      >
                        ¡Lista Completa! 🎉
                      </Typography>
                    </Paper>
                  )}

                  <List dense>
                    {myWishes.map((wish, index) => (
                      <ListItem
                        key={wish.id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDelete(wish.id)}
                          >
                            <Delete color="action" fontSize="small" />
                          </IconButton>
                        }
                        sx={{
                          bgcolor: "background.default",
                          mb: 1,
                          borderRadius: 2,
                        }}
                      >
                        <ListItemText
                          primary={wish.description}
                          secondary={`Deseo #${index + 1}`}
                        />
                      </ListItem>
                    ))}
                    {myWishes.length === 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        py={2}
                      >
                        Aún no tienes deseos.
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* --- COLUMNA DERECHA: DESEOS DEL EQUIPO --- */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" alignItems="center" gap={1} mb={3}>
              <LocationOn color="secondary" />
              <Typography variant="h5" fontWeight="bold">
                Deseos del Equipo
              </Typography>
            </Stack>

            {groupedOtherWishes.map((group, index) => (
              <Accordion
                key={index}
                disableGutters
                elevation={0}
                sx={{
                  mb: 2,
                  border: "1px solid #eaeff1",
                  borderRadius: "16px !important",
                  "&:before": { display: "none" },
                  bgcolor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Avatar
                      sx={{
                        bgcolor: group.sede === "UIO" ? "#1565c0" : "#ef6c00",
                        mr: 2,
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      {group.name.charAt(0)}
                    </Avatar>

                    <Box flexGrow={1}>
                      <Typography fontWeight="bold" color="text.primary">
                        {group.name}
                      </Typography>
                    </Box>

                    <Chip
                      label={group.sede}
                      size="small"
                      color={group.sede === "UIO" ? "primary" : "warning"}
                      variant="filled" // Si tu tema lo soporta, sino filled es default
                      sx={{ mr: 1, fontWeight: "bold" }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{ bgcolor: "#fafafa", borderTop: "1px solid #f5f5f5" }}
                >
                  <List>
                    {group.wishes.map((wish) => (
                      <ListItem key={wish.id} sx={{ py: 0.5 }}>
                        <CardGiftcard
                          fontSize="small"
                          sx={{ mr: 2, color: "text.disabled" }}
                        />
                        <ListItemText
                          primary={wish.description}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}

            {groupedOtherWishes.length === 0 && !loading && (
              <Box textAlign="center" py={5}>
                <Typography color="text.disabled">
                  Nadie más ha publicado deseos todavía.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

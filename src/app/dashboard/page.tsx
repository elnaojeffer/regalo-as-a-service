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
  Divider,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // Asegúrate de usar Grid2 si estás en MUI v6
import {
  ExpandMore,
  Delete,
  AddCircle,
  CardGiftcard,
  Logout,
  CloudQueue,
  Event,
  Celebration,
  Settings,
} from "@mui/icons-material";
import confetti from "canvas-confetti";

// Valores por defecto (mientras carga la BD)
const DEFAULT_SORTEO = new Date("2025-12-05T15:00:00");
const DEFAULT_INTERCAMBIO = new Date("2025-12-23T14:00:00");

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

export default function DashboardPage() {
  const router = useRouter();

  // Estados de Datos
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [newWish, setNewWish] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // NUEVO ESTADO PARA CONTROLAR LA HIDRATACIÓN
  const [mounted, setMounted] = useState(false);
  // Configuración Dinámica
  const [configAdminEmail, setConfigAdminEmail] = useState("");
  const [dateSorteo, setDateSorteo] = useState<Date>(DEFAULT_SORTEO);
  const [dateIntercambio, setDateIntercambio] =
    useState<Date>(DEFAULT_INTERCAMBIO);

  // Estados de Contadores
  const [timeSorteo, setTimeSorteo] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    finished: false,
  });
  const [timeIntercambio, setTimeIntercambio] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    finished: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- 1. CARGA UNIFICADA (Seguridad + Config + Datos) ---
  useEffect(() => {
    const initData = async () => {
      try {
        // A. Verificar Sesión
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/");
          return;
        }
        setCurrentUser(session.user);

        // B. Cargar Configuración (Admin y Fechas)
        const { data: configData } = await supabase.from("config").select("*");

        if (configData) {
          const adminCfg = configData.find((c) => c.key === "admin_email");
          const sorteoCfg = configData.find((c) => c.key === "fecha_sorteo");
          const intercambioCfg = configData.find(
            (c) => c.key === "fecha_intercambio"
          );

          if (adminCfg) setConfigAdminEmail(adminCfg.value);
          if (sorteoCfg) setDateSorteo(new Date(sorteoCfg.value));
          if (intercambioCfg)
            setDateIntercambio(new Date(intercambioCfg.value));
        }

        // C. Cargar Deseos
        await fetchWishes();
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    initData();
  }, [router]);

  // --- 2. TIMER LOOP ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSorteo(calculateTimeLeft(dateSorteo));
      setTimeIntercambio(calculateTimeLeft(dateIntercambio));
    }, 1000);
    return () => clearInterval(timer);
  }, [dateSorteo, dateIntercambio]);

  // Helpers
  const calculateTimeLeft = (target: Date) => {
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      finished: false,
    };
  };

  const fetchWishes = async () => {
    const { data } = await supabase
      .from("wishes")
      .select("*, profiles(full_name, sede)")
      .order("created_at", { ascending: false });
    if (data) setWishes(data);
  };

  // Handlers
  const handleAddWish = async () => {
    if (!newWish.trim() || !currentUser) return;
    const myCount = wishes.filter((w) => w.user_id === currentUser.id).length;
    if (myCount >= 3) {
      alert("¡Ya tienes 3 deseos!");
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

  // Memos
  const myWishes = useMemo(
    () => wishes.filter((w) => w.user_id === currentUser?.id),
    [wishes, currentUser]
  );

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

  const TimeDigit = ({ val, label }: { val: number; label: string }) => (
    <Box textAlign="center" mx={0.5}>
      <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
        {String(val).padStart(2, "0")}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: "0.6rem", opacity: 0.8 }}>
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F5" }}>
      {/* NAVBAR */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <CloudQueue sx={{ mr: 2 }} />
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
            sx={{ mr: 2, display: { xs: "none", sm: "block" } }}
          >
            {currentUser?.user_metadata?.full_name}
          </Typography>

          {/* BOTÓN ADMIN DINÁMICO: Solo si el email coincide con la BD */}
          {currentUser?.email === configAdminEmail && (
            <IconButton
              onClick={() => router.push("/admin")}
              sx={{ color: "white", mr: 1 }}
            >
              <Settings />
            </IconButton>
          )}

          <IconButton onClick={handleLogout} sx={{ color: "white" }}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
        {/* TIMELINE */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {/* CARD SORTEO */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={3}
              sx={{
                background: "linear-gradient(135deg, #1A237E 0%, #283593 100%)",
                color: "white",
                borderRadius: 4,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Event
                sx={{
                  position: "absolute",
                  right: -20,
                  bottom: -20,
                  fontSize: 100,
                  opacity: 0.1,
                }}
              />
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ opacity: 0.8, letterSpacing: 1 }}
                  >
                    FASE 1
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                    El Sorteo 🎲
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {dateSorteo.toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    p: 1.5,
                    borderRadius: 3,
                    backdropFilter: "blur(5px)",
                  }}
                >
                  {timeSorteo.finished ? (
                    <Chip
                      label="¡COMPLETADO!"
                      color="success"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  ) : (
                    <Stack direction="row" gap={1}>
                      <TimeDigit val={timeSorteo.days} label="d" />:
                      <TimeDigit val={timeSorteo.hours} label="h" />:
                      <TimeDigit val={timeSorteo.minutes} label="m" />
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* CARD INTERCAMBIO */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={3}
              sx={{
                background: "linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)",
                color: "white",
                borderRadius: 4,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Celebration
                sx={{
                  position: "absolute",
                  right: -20,
                  bottom: -20,
                  fontSize: 100,
                  opacity: 0.1,
                }}
              />
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ opacity: 0.8, letterSpacing: 1 }}
                  >
                    FASE 2
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                    Intercambio 🎁
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {dateIntercambio.toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    p: 1.5,
                    borderRadius: 3,
                    backdropFilter: "blur(5px)",
                  }}
                >
                  {timeIntercambio.finished ? (
                    <Chip
                      label="¡ES HOY!"
                      color="warning"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  ) : (
                    <Stack direction="row" gap={1}>
                      <TimeDigit val={timeIntercambio.days} label="d" />:
                      <TimeDigit val={timeIntercambio.hours} label="h" />:
                      <TimeDigit val={timeIntercambio.minutes} label="m" />
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* RESTO DE LA INTERFAZ (Listas de deseos) - Se mantiene igual */}
        <Grid container spacing={4}>
          {/* ... Misma lógica de Mi Carta y Lista de Equipo ... */}
          {/* (Omití el resto del JSX repetitivo para ahorrar espacio, 
               pero debes dejar el Grid container, la columna izquierda y derecha tal cual estaba) */}

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: "sticky", top: 100 }}>
              <Card elevation={4} sx={{ borderRadius: 4, overflow: "visible" }}>
                <Box
                  sx={{
                    background:
                      "linear-gradient(90deg, #6A1B9A 0%, #8E24AA 100%)",
                    height: 10,
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
                        Capacidad
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight="bold"
                        color="primary"
                      >
                        {myWishes.length}/3
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(myWishes.length / 3) * 100}
                      color={myWishes.length === 3 ? "success" : "secondary"}
                      sx={{ height: 8, borderRadius: 4, bgcolor: "#EDE7F6" }}
                    />
                  </Box>
                  {myWishes.length < 3 ? (
                    <Box display="flex" gap={1} mb={3}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Deseo..."
                        value={newWish}
                        onChange={(e) => setNewWish(e.target.value)}
                      />
                      <IconButton
                        color="secondary"
                        onClick={handleAddWish}
                        disabled={!newWish.trim()}
                      >
                        <AddCircle />
                      </IconButton>
                    </Box>
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        bgcolor: "#E8F5E9",
                        border: "1px solid #C8E6C9",
                        p: 1,
                        mb: 3,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="success.dark"
                        fontWeight="bold"
                      >
                        ¡Lista Completa!
                      </Typography>
                    </Paper>
                  )}
                  <List dense>
                    {myWishes.map((w, i) => (
                      <ListItem
                        key={w.id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDelete(w.id)}
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
                          primary={w.description}
                          secondary={`Deseo #${i + 1}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            {/* Acordeones del equipo (Mismo código anterior) */}
            <Stack direction="row" alignItems="center" gap={1} mb={3}>
              <CloudQueue sx={{ color: "#4A148C" }} />
              <Typography variant="h5" fontWeight="bold">
                Backlog de Regalos
              </Typography>
            </Stack>
            {groupedOtherWishes.map((group, i) => (
              <Accordion
                key={i}
                disableGutters
                elevation={0}
                sx={{
                  mb: 2,
                  border: "1px solid #E0E0E0",
                  borderRadius: "12px !important",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Avatar
                    sx={{
                      mr: 2,
                      bgcolor: group.sede === "UIO" ? "#6A1B9A" : "#4A148C",
                    }}
                  >
                    {group.name.charAt(0)}
                  </Avatar>
                  <Typography fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {group.name}
                  </Typography>
                  <Chip label={group.sede} size="small" />
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {group.wishes.map((w) => (
                      <ListItem key={w.id}>
                        <CardGiftcard fontSize="small" sx={{ mr: 2 }} />
                        <ListItemText primary={w.description} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

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
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
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
  Lock,
  Visibility,
  PersonSearch,
} from "@mui/icons-material";
import confetti from "canvas-confetti";

// Valores por defecto
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

interface Assignment {
  recipient: {
    full_name: string;
    sede: string;
    wishes: { description: string }[];
  };
}

export default function DashboardPage() {
  const router = useRouter();

  // Estados
  const [mounted, setMounted] = useState(false); // Para evitar error de hidratación
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [newWish, setNewWish] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [configAdminEmail, setConfigAdminEmail] = useState("");

  // Estado de Asignación
  const [myAssignment, setMyAssignment] = useState<Assignment | null>(null);

  // Fechas y Timers
  const [dateSorteo, setDateSorteo] = useState<Date>(DEFAULT_SORTEO);
  const [dateIntercambio, setDateIntercambio] =
    useState<Date>(DEFAULT_INTERCAMBIO);
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

  // --- 1. CARGA INICIAL ---
  useEffect(() => {
    setMounted(true); // Marca que ya estamos en el cliente

    const initData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/");
          return;
        }
        const user = session.user;
        setCurrentUser(user);

        // Cargar Config
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

        await fetchWishes();

        // Cargar Asignación
        const { data: matchData } = await supabase
          .from("matches")
          .select(
            `recipient:recipient_id ( full_name, sede, wishes ( description ) )`
          )
          .eq("santa_id", user.id)
          .single();

        if (matchData) setMyAssignment(matchData as any);

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    initData();
  }, [router]);

  // --- 2. TIMER LOOP (Se ejecuta cada segundo) ---
  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      setTimeSorteo(calculateTimeLeft(dateSorteo));
      setTimeIntercambio(calculateTimeLeft(dateIntercambio));
    }, 1000);

    return () => clearInterval(timer);
  }, [dateSorteo, dateIntercambio, mounted]);

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

  const myWishes = useMemo(
    () => wishes.filter((w) => w.user_id === currentUser?.id),
    [wishes, currentUser]
  );
  const groupedOtherWishes = useMemo(() => {
    const groups: GroupedWishes = {};
    wishes.forEach((wish) => {
      if (wish.user_id === currentUser?.id) return;
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
    <Box textAlign="center" mx={0.2}>
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ lineHeight: 1, minWidth: "24px" }}
      >
        {String(val).padStart(2, "0")}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: "0.6rem", opacity: 0.8 }}>
        {label}
      </Typography>
    </Box>
  );

  const Separator = () => (
    <Typography variant="h6" sx={{ opacity: 0.5, mb: 1.5 }}>
      :
    </Typography>
  );

  // Evitar renderizado hasta que el cliente esté listo
  if (!mounted) return null;
  if (loading) return null;

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
          {/* CARD 1: SORTEO */}
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
                    {dateSorteo.toLocaleDateString()}
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
                    <Stack direction="row" alignItems="flex-end" gap={0.5}>
                      <TimeDigit val={timeSorteo.days} label="d" />
                      <Separator />
                      <TimeDigit val={timeSorteo.hours} label="h" />
                      <Separator />
                      <TimeDigit val={timeSorteo.minutes} label="m" />
                      <Separator />
                      <TimeDigit val={timeSorteo.seconds} label="s" />{" "}
                      {/* <-- AQUI ESTABA FALTANDO */}
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* CARD 2: INTERCAMBIO */}
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
                    {dateIntercambio.toLocaleDateString()}
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
                    <Stack direction="row" alignItems="flex-end" gap={0.5}>
                      <TimeDigit val={timeIntercambio.days} label="d" />
                      <Separator />
                      <TimeDigit val={timeIntercambio.hours} label="h" />
                      <Separator />
                      <TimeDigit val={timeIntercambio.minutes} label="m" />
                      <Separator />
                      <TimeDigit val={timeIntercambio.seconds} label="s" />
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* TARJETA DE MISIÓN (SI YA HUBO SORTEO) */}
        {myAssignment && (
          <Box mb={6} sx={{ animation: "fadeIn 1s ease-in" }}>
            <Card
              elevation={6}
              sx={{
                border: "2px solid #8E24AA",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  bgcolor: "#F3E5F5",
                  p: 2,
                  borderBottom: "1px solid #E1BEE7",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <PersonSearch color="secondary" />
                <Typography variant="h6" color="secondary" fontWeight="bold">
                  ¡Misión Asignada! Tu amigo secreto es:
                </Typography>
              </Box>
              <CardContent>
                <Grid container spacing={4} alignItems="center">
                  <Grid size={{ xs: 12, md: 4 }} textAlign="center">
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: 40,
                        bgcolor: "#6A1B9A",
                        margin: "0 auto",
                        mb: 2,
                      }}
                    >
                      {myAssignment.recipient.full_name.charAt(0)}
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {myAssignment.recipient.full_name}
                    </Typography>
                    <Chip
                      label={myAssignment.recipient.sede}
                      sx={{
                        mt: 1,
                        bgcolor: "#E1BEE7",
                        color: "#4A148C",
                        fontWeight: "bold",
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box
                      sx={{
                        bgcolor: "#FAFAFA",
                        p: 3,
                        borderRadius: 3,
                        border: "1px dashed #BDBDBD",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        mb={2}
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Visibility fontSize="small" color="disabled" /> Sus
                        Deseos Revelados:
                      </Typography>
                      {myAssignment.recipient.wishes.length > 0 ? (
                        <List dense>
                          {myAssignment.recipient.wishes.map((w, i) => (
                            <ListItem key={i}>
                              <CardGiftcard color="secondary" sx={{ mr: 2 }} />
                              <ListItemText
                                primary={w.description}
                                primaryTypographyProps={{ fontSize: "1.1rem" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography color="text.secondary" fontStyle="italic">
                          Esta persona no registró deseos. ¡Sorpréndela!
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        <Grid container spacing={4}>
          {/* MI CARTA */}
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

          {/* BACKLOG DE EQUIPO */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" alignItems="center" gap={1} mb={3}>
              <CloudQueue sx={{ color: "#4A148C" }} />
              <Typography variant="h5" fontWeight="bold">
                Participantes ({groupedOtherWishes.length})
              </Typography>
            </Stack>
            {groupedOtherWishes.length === 0 && !loading && (
              <Alert severity="info">Nadie más se ha registrado aún.</Alert>
            )}
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
                  <Box flexGrow={1}>
                    <Typography fontWeight="bold">{group.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.wishes.length > 0
                        ? `${group.wishes.length} deseos guardados`
                        : "Sin deseos aún"}
                    </Typography>
                  </Box>
                  <Chip label={group.sede} size="small" variant="outlined" />
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: "#FAFAFA" }}>
                  <List>
                    {group.wishes.length > 0 ? (
                      group.wishes.map((w, idx) => (
                        <ListItem key={w.id}>
                          <Lock
                            fontSize="small"
                            sx={{ mr: 2, color: "text.disabled" }}
                          />
                          <ListItemText
                            primary="Deseo Secreto"
                            secondary="Solo visible para su Amigo Secreto"
                            primaryTypographyProps={{
                              fontWeight: "bold",
                              color: "text.secondary",
                            }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="caption" color="text.disabled" p={2}>
                        Aún no agrega deseos.
                      </Typography>
                    )}
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

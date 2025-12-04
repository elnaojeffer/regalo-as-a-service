"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Stack, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import { CloudQueue, Event, Celebration } from "@mui/icons-material";
import { supabase } from "@/lib/supabase";

// Componentes
import DashboardNavbar from "./components/DashboardNavbar";
import PhaseCard from "./components/PhaseCard";
import AssignmentCard from "./components/AssignmentCard";
import WishCard from "./components/WishCard";
import ParticipantAccordion from "./components/ParticipantAccordion";

// Hooks
import { useDashboardData } from "./hooks/useDashboardData";
import { useCountdown } from "./hooks/useCountdown";
import { useWishActions } from "./hooks/useWishActions";
import { filterMyWishes, groupWishesByUser } from "./utils/wishUtils";

// Utils

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  // Hook principal de datos
  const {
    currentUser,
    wishes,
    myAssignment,
    configAdminEmail,
    dateSorteo,
    dateIntercambio,
    loading,
    fetchWishes,
  } = useDashboardData();

  // Hooks de countdown
  const timeSorteo = useCountdown(dateSorteo, mounted);
  const timeIntercambio = useCountdown(dateIntercambio, mounted);

  // Hook de acciones de deseos
  const { newWish, setNewWish, handleAddWish, handleDeleteWish } =
    useWishActions({
      currentUser,
      wishes,
      onWishesUpdate: fetchWishes,
    });

  // Montaje del componente
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handlers
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Memoized data
  const myWishes = useMemo(
    () => filterMyWishes(wishes, currentUser?.id),
    [wishes, currentUser]
  );

  const groupedOtherWishes = useMemo(
    () => groupWishesByUser(wishes, currentUser?.id),
    [wishes, currentUser]
  );

  // Loading states
  if (!mounted) return null;
  if (loading) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F5" }}>
      <DashboardNavbar
        userName={currentUser?.user_metadata?.full_name || "Usuario"}
        isAdmin={currentUser?.email === configAdminEmail}
        onAdminClick={() => router.push("/admin")}
        onLogout={handleLogout}
      />

      <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
        {/* TIMELINE - Fases */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <PhaseCard
              phase="FASE 1"
              title="El Sorteo 🎲"
              icon={Event}
              date={dateSorteo}
              gradient="linear-gradient(135deg, #1A237E 0%, #283593 100%)"
              timeLeft={timeSorteo}
              finishedLabel="¡COMPLETADO!"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <PhaseCard
              phase="FASE 2"
              title="Intercambio 🎁"
              icon={Celebration}
              date={dateIntercambio}
              gradient="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
              timeLeft={timeIntercambio}
              finishedLabel="¡ES HOY!"
            />
          </Grid>
        </Grid>

        {/* TARJETA DE MISIÓN */}
        {myAssignment && (
          <Box mb={6} sx={{ animation: "fadeIn 1s ease-in" }}>
            <AssignmentCard recipient={myAssignment.recipient} />
          </Box>
        )}

        <Grid container spacing={4}>
          {/* MI CARTA */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: "sticky", top: 100 }}>
              <WishCard
                wishes={myWishes.map((w) => ({
                  id: w.id,
                  description: w.description || "",
                }))}
                newWish={newWish}
                onWishChange={setNewWish}
                onAddWish={handleAddWish}
                onDeleteWish={handleDeleteWish}
              />
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
              <ParticipantAccordion
                key={i}
                name={group.name}
                sede={group.sede}
                wishes={group.wishes}
              />
            ))}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

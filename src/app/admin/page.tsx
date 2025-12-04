"use client";

import { useRouter } from "next/navigation";
import { Box, Container } from "@mui/material";

// Hooks
import { useAdminData } from "./hooks/useAdminData";
import { useConfigForm } from "./hooks/useConfigForm";
import { useSorteo } from "./hooks/useSorteo";
import { BackButton } from "./components/BackButton";
import { AdminHeader } from "./components/AdminHeader";
import { ConfigurationCard } from "./components/ConfigurationCard";
import { MatchLogList } from "./components/MatchLogList";
import { SorteoCard } from "./components/SorteoCard";

export default function AdminPage() {
  const router = useRouter();

  // Hook de datos del admin
  const { currentAdminEmail, matches, fetching, fetchMatches } = useAdminData();

  // Hook de configuración
  const {
    formDateSorteo,
    formDateIntercambio,
    formAdminEmail,
    savingConfig,
    setFormDateSorteo,
    setFormDateIntercambio,
    setFormAdminEmail,
    handleSaveConfig,
  } = useConfigForm();

  // Hook de sorteo
  const { loading: sorteoLoading, handleRunSorteo } = useSorteo(fetchMatches);

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
        <BackButton onClick={() => router.push("/dashboard")} />
        <AdminHeader adminEmail={currentAdminEmail} />
        <ConfigurationCard
          adminEmail={formAdminEmail}
          dateSorteo={formDateSorteo}
          dateIntercambio={formDateIntercambio}
          onAdminEmailChange={setFormAdminEmail}
          onDateSorteoChange={setFormDateSorteo}
          onDateIntercambioChange={setFormDateIntercambio}
          onSave={handleSaveConfig}
          saving={savingConfig}
        />
        <SorteoCard loading={sorteoLoading} onExecute={handleRunSorteo} />
        <MatchLogList matches={matches} fetching={fetching} />
      </Container>
    </Box>
  );
}

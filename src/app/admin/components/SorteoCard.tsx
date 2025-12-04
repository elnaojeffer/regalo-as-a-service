import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { WarningAmber, AutoFixHigh } from "@mui/icons-material";

interface SorteoCardProps {
  loading: boolean;
  onExecute: () => void;
}

export const SorteoCard = ({ loading, onExecute }: SorteoCardProps) => {
  return (
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
          onClick={onExecute}
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
  );
};

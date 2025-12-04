import {
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { AccessTime, Save } from "@mui/icons-material";

interface ConfigurationCardProps {
  adminEmail: string;
  dateSorteo: string;
  dateIntercambio: string;
  onAdminEmailChange: (value: string) => void;
  onDateSorteoChange: (value: string) => void;
  onDateIntercambioChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}

export const ConfigurationCard = ({
  adminEmail,
  dateSorteo,
  dateIntercambio,
  onAdminEmailChange,
  onDateSorteoChange,
  onDateIntercambioChange,
  onSave,
  saving,
}: ConfigurationCardProps) => {
  return (
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

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Correo del Administrador"
              variant="filled"
              value={adminEmail}
              onChange={(e) => onAdminEmailChange(e.target.value)}
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
              value={dateSorteo}
              onChange={(e) => onDateSorteoChange(e.target.value)}
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
              value={dateIntercambio}
              onChange={(e) => onDateIntercambioChange(e.target.value)}
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                input: { color: "white" },
                label: { color: "gray" },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              onClick={onSave}
              disabled={saving}
              variant="contained"
              fullWidth
              startIcon={<Save />}
              sx={{ bgcolor: "#7B1FA2", "&:hover": { bgcolor: "#4A148C" } }}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

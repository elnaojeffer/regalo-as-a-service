import { Box, Typography, Chip } from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";

interface AdminHeaderProps {
  adminEmail: string;
}

export const AdminHeader = ({ adminEmail }: AdminHeaderProps) => {
  return (
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
        Admin: <span style={{ color: "#E1BEE7" }}>{adminEmail}</span>
      </Typography>
    </Box>
  );
};

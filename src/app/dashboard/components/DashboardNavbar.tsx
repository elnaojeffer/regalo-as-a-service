import { AppBar, Toolbar, Box, Typography, IconButton } from "@mui/material";
import { CloudQueue, Settings, Logout } from "@mui/icons-material";

interface DashboardNavbarProps {
  userName: string;
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
}

export default function DashboardNavbar({
  userName,
  isAdmin,
  onAdminClick,
  onLogout,
}: DashboardNavbarProps) {
  return (
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
          {userName}
        </Typography>
        {isAdmin && (
          <IconButton onClick={onAdminClick} sx={{ color: "white", mr: 1 }}>
            <Settings />
          </IconButton>
        )}
        <IconButton onClick={onLogout} sx={{ color: "white" }}>
          <Logout />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

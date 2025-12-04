import { Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <Button
      startIcon={<ArrowBack />}
      onClick={onClick}
      sx={{
        color: "rgba(255,255,255,0.7)",
        mb: 2,
        textTransform: "none",
        "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
      }}
    >
      Volver al Dashboard
    </Button>
  );
};

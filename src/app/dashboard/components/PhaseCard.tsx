import { Card, CardContent, Box, Typography } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import { CountdownTimer } from "./CountdownTimer";

interface PhaseCardProps {
  phase: string;
  title: string;
  icon: SvgIconComponent;
  date: Date;
  gradient: string;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    finished: boolean;
  };
  finishedLabel?: string;
}

export default function PhaseCard({
  phase,
  title,
  icon: Icon,
  date,
  gradient,
  timeLeft,
  finishedLabel,
}: PhaseCardProps) {
  return (
    <Card
      elevation={3}
      sx={{
        background: gradient,
        color: "white",
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Icon
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
            {phase}
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {date.toLocaleDateString()}
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
          <CountdownTimer {...timeLeft} finishedLabel={finishedLabel} />
        </Box>
      </CardContent>
    </Card>
  );
}

import { Box, Chip, Stack, Typography } from "@mui/material";

export interface TimeDigitProps {
  val: number;
  label: string;
}

export interface CountdownTimerProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
  finishedLabel?: string;
}

export const CountdownTimer = ({
  days,
  hours,
  minutes,
  seconds,
  finished,
  finishedLabel = "¡COMPLETADO!",
}: CountdownTimerProps) => {
  if (finished) {
    return (
      <Chip
        label={finishedLabel}
        color="success"
        size="small"
        sx={{ fontWeight: "bold" }}
      />
    );
  }

  const TimeDigit = ({ label, val }: TimeDigitProps) => (
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

  const TimeSeparator = () => (
    <Typography variant="h6" sx={{ opacity: 0.5, mb: 1.5 }}>
      :
    </Typography>
  );

  return (
    <Stack direction="row" alignItems="flex-end" gap={0.5}>
      <TimeDigit val={days} label="d" />
      <TimeSeparator />
      <TimeDigit val={hours} label="h" />
      <TimeSeparator />
      <TimeDigit val={minutes} label="m" />
      <TimeSeparator />
      <TimeDigit val={seconds} label="s" />
    </Stack>
  );
};

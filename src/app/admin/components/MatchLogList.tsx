import {
  Box,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Security, ArrowForward } from "@mui/icons-material";

interface Match {
  id: number;
  created_at: string;
  santa: { full_name: string } | null;
  recipient: { full_name: string } | null;
}

interface MatchLogListProps {
  matches: Match[];
  fetching: boolean;
}

export const MatchLogList = ({ matches, fetching }: MatchLogListProps) => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          <Security color="secondary" sx={{ mr: 1, verticalAlign: "bottom" }} />{" "}
          Asignaciones
        </Typography>
        <Chip
          label={`${matches.length} Registros`}
          color="secondary"
          variant="outlined"
        />
      </Box>

      {fetching ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            maxHeight: 600,
            overflow: "auto",
            bgcolor: "rgba(0,0,0,0.4)",
            border: "1px solid #333",
          }}
        >
          <List>
            {matches.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography color="gray" textAlign="center">
                      No hay asignaciones aún
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              matches.map((m, i) => (
                <div key={m.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box flex={1}>
                            <Typography variant="caption" color="gray">
                              SANTA
                            </Typography>
                            <Typography color="#A5D6A7" fontWeight="bold">
                              {m.santa?.full_name || "?"}
                            </Typography>
                          </Box>
                          <ArrowForward sx={{ color: "gray" }} />
                          <Box flex={1} textAlign="right">
                            <Typography variant="caption" color="gray">
                              RECIBE
                            </Typography>
                            <Typography color="#FFCC80" fontWeight="bold">
                              {m.recipient?.full_name || "?"}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {i < matches.length - 1 && (
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                  )}
                </div>
              ))
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
};

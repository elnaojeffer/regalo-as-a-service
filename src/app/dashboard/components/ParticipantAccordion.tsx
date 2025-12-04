import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { ExpandMore, Lock, CardGiftcard } from "@mui/icons-material";

interface Wish {
  id: number;
  description: string | null;
}

interface ParticipantAccordionProps {
  name: string;
  sede: string;
  wishes: Wish[];
}

export default function ParticipantAccordion({
  name,
  sede,
  wishes,
}: ParticipantAccordionProps) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        mb: 2,
        border: "1px solid #E0E0E0",
        borderRadius: "12px !important",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Avatar
          sx={{
            mr: 2,
            bgcolor: sede === "UIO" ? "#6A1B9A" : "#4A148C",
          }}
        >
          {name.charAt(0)}
        </Avatar>
        <Box flexGrow={1}>
          <Typography fontWeight="bold">{name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {wishes.length > 0
              ? `${wishes.length} deseos guardados`
              : "Sin deseos aún"}
          </Typography>
        </Box>
        <Chip label={sede} size="small" variant="outlined" />
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: "#FAFAFA" }}>
        <List>
          {wishes.length > 0 ? (
            wishes.map((w) => (
              <ListItem key={w.id}>
                {w.description === null ? (
                  <>
                    <Lock
                      fontSize="small"
                      sx={{ mr: 2, color: "text.disabled" }}
                    />
                    <ListItemText
                      primary="Deseo Secreto"
                      secondary="Solo visible para su Amigo Secreto"
                      slotProps={{
                        primary: {
                          fontWeight: "bold",
                          color: "text.secondary",
                        },
                      }}
                    />
                  </>
                ) : (
                  <>
                    <CardGiftcard
                      fontSize="small"
                      sx={{ mr: 2, color: "secondary.main" }}
                    />
                    <ListItemText primary={w.description} />
                  </>
                )}
              </ListItem>
            ))
          ) : (
            <Typography variant="caption" color="text.disabled" p={2}>
              Aún no agrega deseos.
            </Typography>
          )}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}

import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { PersonSearch, Visibility, CardGiftcard } from "@mui/icons-material";

interface AssignmentCardProps {
  recipient: {
    full_name: string;
    sede: string;
    wishes: { description: string }[];
  };
}

export default function AssignmentCard({ recipient }: AssignmentCardProps) {
  return (
    <Card
      elevation={6}
      sx={{
        border: "2px solid #8E24AA",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          bgcolor: "#F3E5F5",
          p: 2,
          borderBottom: "1px solid #E1BEE7",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <PersonSearch color="secondary" />
        <Typography variant="h6" color="secondary" fontWeight="bold">
          ¡Misión Asignada! Debes regalar a:
        </Typography>
      </Box>
      <CardContent>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }} textAlign="center">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: 40,
                bgcolor: "#6A1B9A",
                margin: "0 auto",
                mb: 2,
              }}
            >
              {recipient.full_name.charAt(0)}
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {recipient.full_name}
            </Typography>
            <Chip
              label={recipient.sede}
              sx={{
                mt: 1,
                bgcolor: "#E1BEE7",
                color: "#4A148C",
                fontWeight: "bold",
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                bgcolor: "#FAFAFA",
                p: 3,
                borderRadius: 3,
                border: "1px dashed #BDBDBD",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                mb={2}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Visibility fontSize="small" color="disabled" /> Sus Deseos
                Revelados:
              </Typography>
              {recipient.wishes.length > 0 ? (
                <List dense>
                  {recipient.wishes.map((w, i) => (
                    <ListItem key={i}>
                      <CardGiftcard color="secondary" sx={{ mr: 2 }} />
                      <ListItemText
                        primary={w.description}
                        slotProps={{
                          primary: {
                            fontSize: "1.1rem",
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" fontStyle="italic">
                  Esta persona no registró deseos. ¡Sorpréndela!
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

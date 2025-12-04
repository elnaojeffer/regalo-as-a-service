import {
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Stack,
  Paper,
} from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";

interface Wish {
  id: number;
  description: string;
}

interface WishCardProps {
  wishes: Wish[];
  newWish: string;
  onWishChange: (value: string) => void;
  onAddWish: () => void;
  onDeleteWish: (id: number) => void;
}

export default function WishCard({
  wishes,
  newWish,
  onWishChange,
  onAddWish,
  onDeleteWish,
}: WishCardProps) {
  return (
    <Card elevation={4} sx={{ borderRadius: 4, overflow: "visible" }}>
      <Box
        sx={{
          background: "linear-gradient(90deg, #6A1B9A 0%, #8E24AA 100%)",
          height: 10,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Mi Carta 📜
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Capacidad
            </Typography>
            <Typography variant="caption" fontWeight="bold" color="primary">
              {wishes.length}/3
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(wishes.length / 3) * 100}
            color={wishes.length === 3 ? "success" : "secondary"}
            sx={{ height: 8, borderRadius: 4, bgcolor: "#EDE7F6" }}
          />
        </Box>
        {wishes.length < 3 ? (
          <Box display="flex" gap={1} mb={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Deseo..."
              value={newWish}
              onChange={(e) => onWishChange(e.target.value)}
            />
            <IconButton
              color="secondary"
              onClick={onAddWish}
              disabled={!newWish.trim()}
            >
              <AddCircle />
            </IconButton>
          </Box>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              bgcolor: "#E8F5E9",
              border: "1px solid #C8E6C9",
              p: 1,
              mb: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="success.dark" fontWeight="bold">
              ¡Lista Completa!
            </Typography>
          </Paper>
        )}
        <List dense>
          {wishes.map((w, i) => (
            <ListItem
              key={w.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => onDeleteWish(w.id)}
                >
                  <Delete color="action" fontSize="small" />
                </IconButton>
              }
              sx={{
                bgcolor: "background.default",
                mb: 1,
                borderRadius: 2,
              }}
            >
              <ListItemText
                primary={w.description}
                secondary={`Deseo #${i + 1}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

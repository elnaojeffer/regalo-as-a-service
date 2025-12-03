// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Box, Container, Typography, TextField, Button, 
  List, ListItem, ListItemText, IconButton, 
  Card, CardContent, Alert 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Asegúrate de instalar @mui/icons-material
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

interface Gift {
  id: number;
  name: string;
}

export default function DashboardPage() {
  const [giftName, setGiftName] = useState('');
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [error, setError] = useState('');

  const handleAddGift = () => {
    setError('');
    
    // Regla de negocio: Máximo 3 regalos
    if (gifts.length >= 3) {
      setError('¡Jo jo jo! Solo puedes pedir 3 regalos para dejar espacio en el trineo.');
      return;
    }

    if (!giftName.trim()) return;

    setGifts([...gifts, { id: Date.now(), name: giftName }]);
    setGiftName('');
  };

  const handleDelete = (id: number) => {
    setGifts(gifts.filter(gift => gift.id !== id));
    setError('');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, pb: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Mi Carta a Santa 📜
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tienes {3 - gifts.length} deseos disponibles
            </Typography>
          </Box>

          {/* Input Area */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField 
              fullWidth 
              label="¿Qué deseas este año?" 
              variant="outlined"
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddGift()}
              disabled={gifts.length >= 3}
              size="small"
            />
            <Button 
              variant="contained" 
              onClick={handleAddGift}
              disabled={gifts.length >= 3 || !giftName.trim()}
              sx={{ px: 3, fontWeight: 'bold' }}
            >
              Pedir
            </Button>
          </Box>

          {/* Mensaje de Error */}
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Lista de Regalos */}
          <List sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
            {gifts.length === 0 && (
              <Typography variant="body2" color="text.disabled" sx={{ p: 2, textAlign: 'center' }}>
                Tu lista está vacía. ¡Escribe tu primer deseo!
              </Typography>
            )}
            
            {gifts.map((gift, index) => (
              <ListItem 
                key={gift.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDelete(gift.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                }
                divider={index < gifts.length - 1}
              >
                <CardGiftcardIcon color="secondary" sx={{ mr: 2 }} />
                <ListItemText 
                  primary={gift.name} 
                  secondary={`Deseo #${index + 1}`} 
                />
              </ListItem>
            ))}
          </List>

        </CardContent>
      </Card>
    </Container>
  );
}
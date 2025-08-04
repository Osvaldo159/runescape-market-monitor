import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useGrandExchange } from '../contexts/GrandExchangeContext';
import ItemSearch from '../components/ItemSearch';
import ItemCard from '../components/ItemCard';
import RefreshIcon from '@mui/icons-material/Refresh';

const Dashboard: React.FC = () => {
  const { 
    items, 
    loading, 
    error, 
    addItem, 
    removeItem, 
    refreshItems 
  } = useGrandExchange();
  
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Manipulador de adição de item
  const handleAddItem = async (itemId: number) => {
    try {
      await addItem(itemId);
      setSnackbar({
        open: true,
        message: 'Item adicionado com sucesso!',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erro ao adicionar item. Tente novamente.',
        severity: 'error',
      });
    }
  };

  // Manipulador de remoção de item
  const handleRemoveItem = (itemId: number) => {
    removeItem(itemId);
    setSnackbar({
      open: true,
      message: 'Item removido com sucesso!',
      severity: 'info',
    });
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Atualizar itens manualmente
  const handleRefresh = async () => {
    try {
      await refreshItems();
      setSnackbar({
        open: true,
        message: 'Dados atualizados com sucesso!',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar dados. Tente novamente.',
        severity: 'error',
      });
    }
  };

  // Filtrar itens baseado na aba ativa
  const filteredItems = items.filter(item => {
    if (activeTab === 1 && item.change24h && item.change24h > 0) return true; // Alta
    if (activeTab === 2 && item.change24h && item.change24h < 0) return true; // Baixa
    if (activeTab === 3 && item.volume24h && item.volume24h > 1000) return true; // Mais negociados
    return activeTab === 0; // Todos
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          RuneScape 3 Market Monitor
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Acompanhe os preços do Grand Exchange em tempo real
        </Typography>
      </Box>

      {/* Barra de busca e ações */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 9 }}>
            <ItemSearch 
              onAddItem={handleAddItem} 
              existingItems={items.map(item => item.id)} 
              loading={loading} 
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading || items.length === 0}
              fullWidth
            >
              Atualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Abas de navegação */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Todos os itens" />
          <Tab label="Em alta" />
          <Tab label="Em baixa" />
          <Tab label="Mais negociados" />
        </Tabs>
      </Box>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Lista de itens */}
      {items.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhum item sendo monitorado
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Use a barra de busca acima para começar a monitorar itens do Grand Exchange
          </Typography>
        </Box>
      ) : filteredItems.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary">
            Nenhum item encontrado nesta categoria
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ItemCard 
                item={item} 
                onRemove={handleRemoveItem} 
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Rodapé */}
      <Box mt={6} pt={3} borderTop={1} borderColor="divider">
        <Typography variant="body2" color="textSecondary" align="center">
          Dados fornecidos pela API do RuneScape. Atualizações a cada minuto.
        </Typography>
      </Box>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;

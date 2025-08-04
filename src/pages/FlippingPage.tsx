import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { 
  Refresh as RefreshIcon, 
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import { useGrandExchange } from '../contexts/GrandExchangeContext';
import FlippingOpportunities from '../components/FlippingOpportunities';
import { findFlippingOpportunities, getFlippingStats } from '../services/flippingService';
import { FlippingOpportunity } from '../services/flippingService';

const FlippingPage: React.FC = () => {
  const theme = useTheme();
  const { items, refreshItems: refreshGeItems, loading: geLoading } = useGrandExchange();
  
  const [opportunities, setOpportunities] = useState<FlippingOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalOpportunities: number;
    avgProfitMargin: number;
    avgPotentialProfit: number;
    highConfidenceCount: number;
    mediumConfidenceCount: number;
    lowConfidenceCount: number;
  } | null>(null);

  // Busca oportunidades de flipping
  const findOpportunities = useCallback(async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Encontra oportunidades de flipping
      const foundOpportunities = findFlippingOpportunities(items);
      setOpportunities(foundOpportunities);
      
      // Calcula estatísticas
      const flippingStats = getFlippingStats(foundOpportunities);
      setStats(flippingStats);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao buscar oportunidades:', err);
      setError('Falha ao buscar oportunidades de flipping. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [items]);

  // Atualiza os dados do Grand Exchange e as oportunidades
  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshGeItems();
      await findOpportunities();
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      setError('Falha ao atualizar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega as oportunidades iniciais
  useEffect(() => {
    if (items.length > 0) {
      findOpportunities();
    }
  }, [items, findOpportunities]);

  // Formata o valor monetário
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Formata a porcentagem
  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Oportunidades de Flipping
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>
        
        <Typography variant="body1" color="textSecondary">
          Encontre as melhores oportunidades de compra e venda no Grand Exchange do RuneScape 3
        </Typography>
        
        {lastUpdated && (
          <Typography variant="caption" color="textSecondary">
            Última atualização: {lastUpdated.toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estatísticas */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Card de Oportunidades */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Paper elevation={0} sx={{ height: '100%' }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Oportunidades
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalOpportunities}
                  </Typography>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
          
          {/* Card de Margem Média */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Paper elevation={0} sx={{ height: '100%' }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Typography variant="body2" color="textSecondary">
                      Margem Média
                    </Typography>
                    <Tooltip title="Margem de lucro média das oportunidades">
                      <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                        <InfoIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography 
                    variant="h4" 
                    color={stats.avgProfitMargin > 0 ? 'success.main' : 'error.main'}
                  >
                    {formatPercentage(stats.avgProfitMargin)}
                  </Typography>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
          
          {/* Card de Lucro Médio */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Paper elevation={0} sx={{ height: '100%' }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Typography variant="body2" color="textSecondary">
                      Lucro Médio
                    </Typography>
                    <Tooltip title="Lucro médio por operação">
                      <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                        <InfoIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="h4">
                    {formatCurrency(stats.avgPotentialProfit)}
                  </Typography>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
          
          {/* Card de Alta Confiança */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Paper elevation={0} sx={{ height: '100%' }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Alta Confiança
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Box 
                      bgcolor="success.main" 
                      width={12} 
                      height={12} 
                      borderRadius="50%" 
                      mr={1} 
                    />
                    <Typography variant="h4">
                      {stats.highConfidenceCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
          
          {/* Card de Média Confiança */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Paper elevation={0} sx={{ height: '100%' }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Média Confiança
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Box 
                      bgcolor="warning.main" 
                      width={12} 
                      height={12} 
                      borderRadius="50%" 
                      mr={1} 
                    />
                    <Typography variant="h4">
                      {stats.mediumConfidenceCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Lista de oportunidades */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <FlippingOpportunities 
          opportunities={opportunities}
          loading={loading || geLoading}
          onRefresh={handleRefresh}
        />
      </Paper>

      {/* Dicas de Flipping */}
      <Card variant="outlined">
        <CardHeader 
          title="Dicas de Flipping"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box display="flex" mb={2}>
                <TrendingUpIcon color="success" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Compre em Baixa, Venda em Alta
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Identifique itens com preço abaixo da média e com tendência de alta para obter o melhor lucro.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box display="flex" mb={2}>
                <TrendingDownIcon color="error" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Cuidado com Quedas Bruscas
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Itens com quedas bruscas podem indicar mudanças no jogo. Verifique as atualizações recentes.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box display="flex" mb={2}>
                <TrendingFlatIcon color="disabled" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Volume é Importante
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Itens com alto volume são mais fáceis de comprar e vender, reduzindo o risco de ficar com itens parados.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Rodapé */}
      <Box mt={6} pt={3} sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="textSecondary" align="center">
          Dados fornecidos pela API do RuneScape. As oportunidades são baseadas em análises de mercado e não garantem lucro.
        </Typography>
      </Box>
    </Container>
  );
};

export default FlippingPage;

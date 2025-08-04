import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  InfoOutlined as InfoIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { FlippingOpportunity } from '../services/flippingService';
import { styled } from '@mui/material/styles';

// Tipos para ordenação
type Order = 'asc' | 'desc';
type OrderBy = 'profitMargin' | 'potentialProfit' | 'volume24h' | 'itemName';

// Estilização personalizada
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

const ConfidenceBadge = styled(Chip)(({ theme, color = 'default' }) => ({
  marginLeft: theme.spacing(1),
  fontWeight: 'bold',
  '&.MuiChip-colorHigh': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  '&.MuiChip-colorMedium': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  '&.MuiChip-colorLow': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
}));

// Componente para exibir a tendência
const TrendIndicator: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  switch (trend) {
    case 'up':
      return <TrendingUpIcon color="success" />;
    case 'down':
      return <TrendingDownIcon color="error" />;
    default:
      return <TrendingFlatIcon color="disabled" />;
  }
};

// Componente para exibir a confiança
const ConfidenceIndicator: React.FC<{ level: 'low' | 'medium' | 'high' }> = ({ level }) => {
  const getLabel = () => {
    switch (level) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      default:
        return 'Baixa';
    }
  };

  const getColor = () => {
    switch (level) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  };

  return (
    <Tooltip title={`Confiança ${getLabel()}`}>
      <ConfidenceBadge 
        label={getLabel()} 
        size="small"
        color={getColor() as any}
      />
    </Tooltip>
  );
};

// Componente principal
export interface FlippingOpportunitiesProps {
  opportunities: FlippingOpportunity[];
  loading?: boolean;
  onRefresh?: () => void;
  onSelectItem?: (itemId: number) => void;
}

const FlippingOpportunities: React.FC<FlippingOpportunitiesProps> = ({
  opportunities,
  loading = false,
  onRefresh,
  onSelectItem,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('profitMargin');

  // Filtra as oportunidades com base na aba ativa
  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];
    
    // Aplica filtros baseados na aba
    if (activeTab === 1) {
      filtered = filtered.filter(opp => opp.confidence === 'high');
    } else if (activeTab === 2) {
      filtered = filtered.filter(opp => opp.trend === 'up');
    } else if (activeTab === 3) {
      filtered = filtered.filter(opp => opp.volume24h > 1000);
    }
    
    // Ordena os resultados
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (orderBy === 'itemName') {
        comparison = a.itemName.localeCompare(b.itemName);
      } else if (orderBy === 'profitMargin') {
        comparison = a.profitMargin - b.profitMargin;
      } else if (orderBy === 'potentialProfit') {
        comparison = a.potentialProfit - b.potentialProfit;
      } else if (orderBy === 'volume24h') {
        comparison = a.volume24h - b.volume24h;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  }, [opportunities, activeTab, order, orderBy]);

  // Manipulador de clique no cabeçalho da tabela para ordenação
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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

  // Renderiza o cabeçalho da tabela
  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell>
          <TableSortLabel
            active={orderBy === 'itemName'}
            direction={orderBy === 'itemName' ? order : 'asc'}
            onClick={() => handleRequestSort('itemName')}
          >
            Item
          </TableSortLabel>
        </TableCell>
        <TableCell align="right">
          <TableSortLabel
            active={orderBy === 'profitMargin'}
            direction={orderBy === 'profitMargin' ? order : 'desc'}
            onClick={() => handleRequestSort('profitMargin')}
          >
            Margem de Lucro
          </TableSortLabel>
        </TableCell>
        <TableCell align="right">
          <TableSortLabel
            active={orderBy === 'potentialProfit'}
            direction={orderBy === 'potentialProfit' ? order : 'desc'}
            onClick={() => handleRequestSort('potentialProfit')}
          >
            Lucro Potencial
          </TableSortLabel>
        </TableCell>
        <TableCell align="right">
          <TableSortLabel
            active={orderBy === 'volume24h'}
            direction={orderBy === 'volume24h' ? order : 'desc'}
            onClick={() => handleRequestSort('volume24h')}
          >
            Volume (24h)
          </TableSortLabel>
        </TableCell>
        <TableCell align="center">Tendência</TableCell>
        <TableCell align="center">Confiança</TableCell>
      </TableRow>
    </TableHead>
  );

  // Renderiza o corpo da tabela
  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" style={{ padding: '40px 0' }}>
            <CircularProgress />
            <Box mt={1}>Buscando oportunidades...</Box>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredOpportunities.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" style={{ padding: '40px 0' }}>
            <Typography variant="body1" color="textSecondary">
              Nenhuma oportunidade encontrada com os filtros atuais.
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return filteredOpportunities.map((opp) => (
      <TableRow 
        key={opp.itemId} 
        hover 
        onClick={() => onSelectItem && onSelectItem(opp.itemId)}
        style={{ cursor: onSelectItem ? 'pointer' : 'default' }}
      >
        <TableCell>
          <Box display="flex" alignItems="center">
            <Box 
              width={32} 
              height={32} 
              bgcolor="action.hover" 
              borderRadius={1}
              mr={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="caption" color="textSecondary">
                {opp.itemId}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {opp.itemName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {formatCurrency(opp.currentPrice)}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Typography 
            variant="body2" 
            color={opp.profitMargin > 0 ? 'success.main' : 'error.main'}
            fontWeight="medium"
          >
            {formatPercentage(opp.profitMargin)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(opp.potentialProfit)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2">
            {opp.volume24h.toLocaleString()}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <TrendIndicator trend={opp.trend} />
        </TableCell>
        <TableCell align="center">
          <ConfidenceIndicator level={opp.confidence} />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Oportunidades de Flipping
          </Typography>
          
          <Box>
            {onRefresh && (
              <Tooltip title="Atualizar oportunidades">
                <IconButton 
                  onClick={onRefresh} 
                  size="small"
                  disabled={loading}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Filtrar">
              <IconButton size="small">
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box mb={2}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Todas" />
            <Tab label="Alta Confiança" />
            <Tab label="Em Alta" />
            <Tab label="Mais Negociados" />
          </Tabs>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            {renderTableHeader()}
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredOpportunities.length > 0 && (
          <Box mt={2} textAlign="right">
            <Typography variant="caption" color="textSecondary">
              Mostrando {filteredOpportunities.length} de {opportunities.length} oportunidades
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default FlippingOpportunities;

import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CloseIcon from '@mui/icons-material/Close';
import { GrandExchangeItem } from '../types/grandExchange';

// Estilização personalizada para o card
const StyledCard = styled(Card)(({ theme }) => ({
  minWidth: 275,
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

// Estilo para o preço
const PriceText = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 'bold',
});

// Estilo para a mudança de preço
const ChangeText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isPositive' && prop !== 'isNeutral',
})<{ isPositive?: boolean; isNeutral?: boolean }>(({ theme, isPositive, isNeutral }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  color: isNeutral ? theme.palette.text.secondary : isPositive ? theme.palette.success.main : theme.palette.error.main,
  fontWeight: 'bold',
  marginLeft: theme.spacing(1),
}));

// Estilo para o botão de remover
const RemoveButton = styled(IconButton)({
  position: 'absolute',
  top: 4,
  right: 4,
  padding: 4,
  color: 'rgba(0, 0, 0, 0.54)',
  '&:hover': {
    color: 'red',
  },
});

interface ItemCardProps {
  item: GrandExchangeItem;
  onRemove: (id: number) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onRemove }) => {
  // Formata o número para moeda
  const formatPrice = (value: number): string => {
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

  // Renderiza o ícone de tendência baseado no valor
  const renderTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUpIcon fontSize="small" />;
    if (value < 0) return <TrendingDownIcon fontSize="small" />;
    return <TrendingFlatIcon fontSize="small" />;
  };

  return (
    <StyledCard>
      <RemoveButton 
        size="small" 
        aria-label="remover item"
        onClick={() => onRemove(item.id)}
      >
        <CloseIcon fontSize="small" />
      </RemoveButton>
      
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <div>
            <Typography variant="h6" component="h3" gutterBottom>
              {item.name || `Item ${item.id}`}
            </Typography>
            <Box display="flex" alignItems="center">
              <PriceText variant="h5">
                {item.price ? formatPrice(item.price) : 'N/A'}
              </PriceText>
              {item.change24h !== undefined && (
                <ChangeText 
                  variant="body2" 
                  isPositive={item.change24h > 0}
                  isNeutral={item.change24h === 0}
                >
                  {renderTrendIcon(item.change24h)}
                  {formatPercentage(item.change24h)}
                </ChangeText>
              )}
            </Box>
          </div>
          
          {/* Espaço para a imagem do item */}
          <Box 
            width={64} 
            height={64} 
            bgcolor="action.hover"
            borderRadius={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            {item.icon ? (
              <img 
                src={item.icon} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            ) : (
              <Typography variant="caption" color="textSecondary">
                Sem imagem
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box mt={2} display="flex" justifyContent="space-between">
          <Tooltip title="Volume (24h)" arrow>
            <Typography variant="body2" color="textSecondary">
              Vol: {item.volume24h ? item.volume24h.toLocaleString() : 'N/A'}
            </Typography>
          </Tooltip>
          
          <Tooltip title="Variação (7d)" arrow>
            <ChangeText 
              variant="body2" 
              isPositive={item.change7d ? item.change7d > 0 : false}
              isNeutral={item.change7d === 0}
            >
              {item.change7d !== undefined && (
                <>
                  {renderTrendIcon(item.change7d)}
                  {formatPercentage(item.change7d)} (7d)
                </>
              )}
            </ChangeText>
          </Tooltip>
          
          <Tooltip title="Atualizado" arrow>
            <Typography variant="caption" color="textSecondary">
              {item.lastUpdated?.toLocaleTimeString()}
            </Typography>
          </Tooltip>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ItemCard;

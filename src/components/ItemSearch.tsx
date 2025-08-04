import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { getPricesByItemName } from '../services/grandExchangeService';

// Estilização personalizada para a lista de sugestões
const SuggestionsList = styled(Paper)({
  position: 'absolute',
  zIndex: 1,
  marginTop: 1,
  left: 0,
  right: 0,
  maxHeight: 300,
  overflow: 'auto',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
});

// Interface para os itens de sugestão
interface SuggestionItem {
  id: number;
  name: string;
  price?: number;
}

interface ItemSearchProps {
  onAddItem: (id: number) => void;
  existingItems: number[];
  loading?: boolean;
}

const ItemSearch: React.FC<ItemSearchProps> = ({ onAddItem, existingItems, loading: parentLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca sugestões quando o termo de busca muda
  useEffect(() => {
    const searchItems = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Aqui você pode implementar uma busca mais sofisticada
        // Por enquanto, vamos simular uma busca simples
        const results = await searchItemsByName(searchTerm);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error('Erro ao buscar itens:', err);
        setError('Falha ao buscar itens. Tente novamente.');
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(searchItems, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Função de busca simulada - substituir por chamada real à API
  const searchItemsByName = async (query: string): Promise<SuggestionItem[]> => {
    // Esta é uma implementação de exemplo
    // Na prática, você chamaria a API de busca do RuneScape aqui
    
    // Exemplo de itens simulados
    const mockItems: SuggestionItem[] = [
      { id: 4151, name: 'Abyssal whip', price: 1000000 },
      { id: 11694, name: 'Dragon scimitar', price: 50000 },
      { id: 11840, name: 'Dragon boots', price: 120000 },
      { id: 11832, name: 'Dragon dagger', price: 18000 },
      { id: 11834, name: 'Dragon longsword', price: 60000 },
    ];

    // Filtra os itens com base no termo de busca
    return mockItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Manipulador de seleção de item
  const handleSelectItem = (item: SuggestionItem) => {
    if (!existingItems.includes(item.id)) {
      onAddItem(item.id);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  // Renderiza o conteúdo de carregamento
  const renderLoading = () => (
    <Box p={2} textAlign="center">
      <CircularProgress size={24} />
      <Typography variant="body2" color="textSecondary">
        Buscando itens...
      </Typography>
    </Box>
  );

  // Renderiza a mensagem de erro
  const renderError = () => (
    <Box p={2}>
      <Typography color="error" variant="body2">
        {error}
      </Typography>
    </Box>
  );

  // Renderiza a mensagem de nenhum resultado
  const renderNoResults = () => (
    <Box p={2}>
      <Typography variant="body2" color="textSecondary">
        Nenhum item encontrado para "{searchTerm}"
      </Typography>
    </Box>
  );

  return (
    <Box position="relative" mb={3}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar itens..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => searchTerm && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        disabled={parentLoading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLoading && <CircularProgress size={24} />}
            </InputAdornment>
          ),
        }}
      />

      {/* Lista de sugestões */}
      {showSuggestions && (
        <SuggestionsList>
          {isLoading ? (
            renderLoading()
          ) : error ? (
            renderError()
          ) : suggestions.length === 0 ? (
            renderNoResults()
          ) : (
            <List>
              {suggestions.map((item) => (
                <ListItem 
                  key={item.id}
                  component="button"
                  onClick={() => handleSelectItem(item)}
                  disabled={existingItems.includes(item.id)}
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.7,
                      pointerEvents: 'none',
                    },
                  }}
                >
                  <ListItemText 
                    primary={item.name} 
                    secondary={item.price ? `${item.price.toLocaleString()} gp` : 'Preço não disponível'} 
                  />
                  {!existingItems.includes(item.id) && (
                    <ListItemIcon>
                      <IconButton edge="end" size="small">
                        <AddIcon />
                      </IconButton>
                    </ListItemIcon>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </SuggestionsList>
      )}
    </Box>
  );
};

export default ItemSearch;

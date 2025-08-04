import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GrandExchangeContextType, GrandExchangeItem, PriceData } from '../types/grandExchange';
import { getLatestPrices, getLast90DaysPrices } from '../services/grandExchangeService';

// Criando o contexto com um valor padrão
const GrandExchangeContext = createContext<GrandExchangeContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useGrandExchange = (): GrandExchangeContextType => {
  const context = useContext(GrandExchangeContext);
  if (!context) {
    throw new Error('useGrandExchange deve ser usado dentro de um GrandExchangeProvider');
  }
  return context;
};

interface GrandExchangeProviderProps {
  children: React.ReactNode;
}

export const GrandExchangeProvider: React.FC<GrandExchangeProviderProps> = ({ children }) => {
  const [items, setItems] = useState<GrandExchangeItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega os dados mais recentes dos itens selecionados
  const refreshItems = useCallback(async () => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Busca preços atuais
      const latestPrices = await getLatestPrices(selectedItems);
      
      // Busca histórico para calcular variações
      const historicalData = await getLast90DaysPrices(selectedItems);

      // Atualiza os itens com os novos dados
      setItems(prevItems => 
        prevItems.map(item => {
          const itemData = latestPrices[item.id];
          const itemHistory = historicalData[item.id] || [];
          
          // Encontra o preço de 24h atrás
          const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
          const price24hAgo = itemHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .find(p => p.timestamp * 1000 <= twentyFourHoursAgo)?.price;

          // Encontra o preço de 7 dias atrás
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const price7dAgo = itemHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .find(p => p.timestamp * 1000 <= sevenDaysAgo)?.price;

          // Calcula volume das últimas 24h
          const volume24h = itemHistory
            .filter(p => p.timestamp * 1000 >= twentyFourHoursAgo && p.volume)
            .reduce((sum, p) => sum + (p.volume || 0), 0);

          return {
            ...item,
            price: itemData?.[0]?.price || 0,
            change24h: price24hAgo ? ((itemData?.[0]?.price || 0) - price24hAgo) / price24hAgo * 100 : 0,
            change7d: price7dAgo ? ((itemData?.[0]?.price || 0) - price7dAgo) / price7dAgo * 100 : 0,
            volume24h,
            lastUpdated: new Date(),
            priceHistory: itemHistory,
          };
        })
      );
    } catch (err) {
      console.error('Erro ao atualizar itens:', err);
      setError('Falha ao carregar dados do Grand Exchange. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [selectedItems]);

  // Efeito para atualizar os itens periodicamente
  useEffect(() => {
    if (selectedItems.length > 0) {
      // Atualiza imediatamente
      refreshItems();
      
      // Configura atualização periódica a cada minuto
      const intervalId = setInterval(refreshItems, 60000);
      
      // Limpa o intervalo quando o componente é desmontado
      return () => clearInterval(intervalId);
    }
  }, [refreshItems, selectedItems]);

  // Adiciona um novo item para monitoramento
  const addItem = async (itemId: number) => {
    try {
      // Verifica se o item já está sendo monitorado
      if (selectedItems.includes(itemId)) {
        console.warn(`Item ${itemId} já está sendo monitorado`);
        return;
      }

      setLoading(true);
      
      // Busca os dados iniciais do item
      const [latestData, historicalData] = await Promise.all([
        getLatestPrices([itemId]),
        getLast90DaysPrices([itemId]),
      ]);

      const itemData = latestData[itemId]?.[0];
      const itemHistory = historicalData[itemId] || [];

      if (!itemData) {
        throw new Error('Item não encontrado');
      }

      // Cria um novo item com os dados iniciais
      const newItem: GrandExchangeItem = {
        id: itemId,
        name: `Item ${itemId}`, // Nome será atualizado posteriormente
        price: itemData.price,
        priceHistory: itemHistory,
        lastUpdated: new Date(),
      };

      // Adiciona o item à lista e aos itens selecionados
      setItems(prevItems => [...prevItems, newItem]);
      setSelectedItems(prev => [...prev, itemId]);
      
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      setError('Falha ao adicionar item. Verifique o ID e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Remove um item do monitoramento
  const removeItem = (itemId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    setSelectedItems(prev => prev.filter(id => id !== itemId));
  };

  // Busca um item pelo ID
  const getItemById = (id: number): GrandExchangeItem | undefined => {
    return items.find(item => item.id === id);
  };

  // Valor do contexto
  const contextValue: GrandExchangeContextType = {
    items,
    loading,
    error,
    selectedItems,
    addItem,
    removeItem,
    refreshItems,
    getItemById,
  };

  return (
    <GrandExchangeContext.Provider value={contextValue}>
      {children}
    </GrandExchangeContext.Provider>
  );
};

export default GrandExchangeContext;

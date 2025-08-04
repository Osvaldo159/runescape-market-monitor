import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Tipos para os dados da API
export interface PriceData {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface ItemPriceData {
  [key: string]: PriceData[];
}

// Configuração do axios com headers personalizados
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'User-Agent': API_CONFIG.USER_AGENT,
    'Accept': 'application/json',
  },
});

/**
 * Obtém dados históricos de preços para um ou mais itens
 * @param ids Array de IDs dos itens
 * @returns Dados históricos de preços
 */
export const getHistoricalPrices = async (ids: number[]): Promise<ItemPriceData> => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.ALL, {
      params: {
        id: ids.join('|'),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados históricos:', error);
    throw error;
  }
};

/**
 * Obtém os preços mais recentes para um ou mais itens
 * @param ids Array de IDs dos itens
 * @returns Dados de preços mais recentes
 */
export const getLatestPrices = async (ids: number[]): Promise<ItemPriceData> => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.LATEST, {
      params: {
        id: ids.join('|'),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar preços mais recentes:', error);
    throw error;
  }
};

/**
 * Obtém dados históricos dos últimos 90 dias para um ou mais itens
 * @param ids Array de IDs dos itens
 * @returns Dados históricos dos últimos 90 dias
 */
export const getLast90DaysPrices = async (ids: number[]): Promise<ItemPriceData> => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.LAST_90_DAYS, {
      params: {
        id: ids.join('|'),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados dos últimos 90 dias:', error);
    throw error;
  }
};

/**
 * Obtém preços por nome do item
 * @param names Array de nomes dos itens
 * @returns Dados de preços para os itens
 */
export const getPricesByItemName = async (names: string[]): Promise<ItemPriceData> => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.LATEST, {
      params: {
        name: names.join('|'),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar preços por nome do item:', error);
    throw error;
  }
};

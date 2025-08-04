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
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  withCredentials: false,
  timeout: 10000, // 10 segundos de timeout
});

// Adiciona um interceptor para log de requisições
apiClient.interceptors.request.use(
  (config) => {
    console.log('Enviando requisição para:', config.url);
    console.log('Método:', config.method);
    console.log('Parâmetros:', config.params);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Adiciona um interceptor para log de respostas
apiClient.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida de:', response.config.url);
    console.log('Status:', response.status);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error);
    return Promise.reject(error);
  }
);

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
  console.log('Buscando preços mais recentes para os IDs:', ids);
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.LATEST, {
      params: {
        id: ids.join('|'),
      },
      validateStatus: function (status) {
        return status < 500; // Resolve apenas se o código de status for menor que 500
      }
    });
    
    console.log('Resposta da API (status:', response.status, '):', response.data);
    
    if (response.status !== 200) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    
    return response.data;
  } catch (error: unknown) {
    console.error('Erro detalhado ao buscar preços mais recentes:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // A requisição foi feita e o servidor respondeu com um status de erro
        console.error('Dados da resposta de erro:', error.response.data);
        console.error('Status do erro:', error.response.status);
        console.error('Cabeçalhos do erro:', error.response.headers);
      } else if (error.request) {
        // A requisição foi feita mas nenhuma resposta foi recebida
        console.error('Nenhuma resposta recebida:', error.request);
      } else {
        // Algo aconteceu na configuração da requisição e causou um erro
        console.error('Erro ao configurar a requisição:', error.message);
      }
    } else if (error instanceof Error) {
      console.error('Erro inesperado:', error.message);
    } else {
      console.error('Erro desconhecido:', error);
    }
    
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

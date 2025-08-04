// Configurações da API do RuneScape 3
export const API_CONFIG = {
  // Usando CORS Anywhere como proxy para evitar problemas de CORS em desenvolvimento
  BASE_URL: 'https://cors-anywhere.herokuapp.com/https://api.weirdgloop.org/exchange/history/rs',
  ENDPOINTS: {
    ALL: '/all',
    SAMPLE: '/sample',
    LAST_90_DAYS: '/last90d',
    LATEST: '/latest',
  },
  USER_AGENT: 'RuneScape3MarketMonitor/1.0 (https://github.com/Osvaldo159/runescape-market-monitor)',
  TIMEOUT: 15000, // 15 segundos
};

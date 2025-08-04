import { GrandExchangeItem } from '../types/grandExchange';

// Interface para os resultados de análise de flipping
export interface FlippingOpportunity {
  itemId: number;
  itemName: string;
  currentPrice: number;
  potentialProfit: number;
  profitMargin: number; // Em porcentagem
  confidence: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  volume24h: number;
  lastUpdated: Date;
  reasons: string[];
}

// Limiares para análise
const THRESHOLDS = {
  PROFIT_MARGIN: {
    MIN: 2, // Margem de lucro mínima de 2%
    GOOD: 5, // Margem de lucro considerada boa
    EXCELLENT: 10, // Margem de lucro considerada excelente
  },
  VOLUME: {
    MIN: 100, // Volume mínimo para considerar um item líquido
    GOOD: 1000, // Volume considerado bom
  },
  VOLATILITY: {
    HIGH: 0.05, // 5% de variação de preço em 24h é considerado alta volatilidade
  },
};

/**
 * Analisa os itens para encontrar oportunidades de flipping
 * @param items Lista de itens do Grand Exchange
 * @returns Lista de oportunidades de flipping ordenadas por lucratividade
 */
export const findFlippingOpportunities = (
  items: GrandExchangeItem[]
): FlippingOpportunity[] => {
  const opportunities: FlippingOpportunity[] = [];

  items.forEach(item => {
    // Ignora itens sem preço ou histórico
    if (item.price === undefined || !item.priceHistory || item.priceHistory.length < 2) {
      return;
    }

    // Ordena o histórico por data (mais recente primeiro)
    const sortedHistory = [...item.priceHistory].sort((a, b) => b.timestamp - a.timestamp);
    
    // Preço atual
    const currentPrice = item.price;
    
    // Preço médio nas últimas 24 horas
    const twentyFourHoursAgo = Date.now() / 1000 - 24 * 60 * 60;
    const last24hPrices = sortedHistory
      .filter(p => p.timestamp >= twentyFourHoursAgo)
      .map(p => p.price);
    
    // Se não houver dados suficientes, pula para o próximo item
    if (last24hPrices.length < 2) return;
    
    const avg24hPrice = last24hPrices.reduce((sum, p) => sum + p, 0) / last24hPrices.length;
    
    // Preço médio nos últimos 7 dias
    const sevenDaysAgo = Date.now() / 1000 - 7 * 24 * 60 * 60;
    const last7dPrices = sortedHistory
      .filter(p => p.timestamp >= sevenDaysAgo)
      .map(p => p.price);
    
    const avg7dPrice = last7dPrices.reduce((sum, p) => sum + p, 0) / last7dPrices.length;
    
    // Calcula a margem de lucro potencial
    const potentialProfit = avg24hPrice - currentPrice;
    const profitMargin = (potentialProfit / currentPrice) * 100;
    
    // Determina a tendência
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (currentPrice > avg24hPrice * 1.02) trend = 'up';
    else if (currentPrice < avg24hPrice * 0.98) trend = 'down';
    
    // Calcula a volatilidade (desvio padrão dos preços nas últimas 24h)
    const variance = last24hPrices.reduce((sum, p) => {
      return sum + Math.pow(p - avg24hPrice, 2);
    }, 0) / last24hPrices.length;
    
    const volatility = Math.sqrt(variance) / avg24hPrice;
    
    // Volume médio nas últimas 24h
    const volume24h = item.volume24h || 0;
    
    // Razões para considerar este item
    const reasons: string[] = [];
    
    // Verifica se atende aos critérios básicos
    if (profitMargin < THRESHOLDS.PROFIT_MARGIN.MIN) return;
    if (volume24h < THRESHOLDS.VOLUME.MIN) return;
    
    // Adiciona razões baseadas nos dados
    if (profitMargin >= THRESHOLDS.PROFIT_MARGIN.EXCELLENT) {
      reasons.push('Alta margem de lucro');
    } else if (profitMargin >= THRESHOLDS.PROFIT_MARGIN.GOOD) {
      reasons.push('Boa margem de lucro');
    }
    
    if (volume24h >= THRESHOLDS.VOLUME.GOOD) {
      reasons.push('Alto volume de negociação');
    }
    
    if (trend === 'up') {
      reasons.push('Tendência de alta');
    } else if (trend === 'down' && profitMargin > THRESHOLDS.PROFIT_MARGIN.GOOD) {
      reasons.push('Preço abaixo da média (oportunidade de compra)');
    }
    
    if (volatility > THRESHOLDS.VOLATILITY.HIGH) {
      reasons.push('Alta volatilidade (mais oportunidades)');
    }
    
    // Se não houver razões suficientes, ignora o item
    if (reasons.length === 0) return;
    
    // Calcula a confiança com base nos fatores
    let confidence: 'low' | 'medium' | 'high' = 'low';
    const confidenceScore = 
      (profitMargin / THRESHOLDS.PROFIT_MARGIN.EXCELLENT * 0.4) +
      (Math.min(volume24h / THRESHOLDS.VOLUME.GOOD, 1) * 0.3) +
      (trend === 'up' ? 0.2 : trend === 'stable' ? 0.1 : 0) +
      (reasons.length / 3 * 0.1);
    
    if (confidenceScore > 0.7) confidence = 'high';
    else if (confidenceScore > 0.4) confidence = 'medium';
    
    // Adiciona a oportunidade
    opportunities.push({
      itemId: item.id,
      itemName: item.name || `Item ${item.id}`,
      currentPrice,
      potentialProfit: Math.round(potentialProfit),
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      confidence,
      trend,
      volume24h,
      lastUpdated: new Date(),
      reasons,
    });
  });
  
  // Ordena por margem de lucro (maior primeiro)
  return opportunities.sort((a, b) => b.profitMargin - a.profitMargin);
};

/**
 * Filtra as oportunidades para exibição
 * @param opportunities Lista de oportunidades
 * @param filters Filtros a serem aplicados
 * @returns Lista de oportunidades filtradas
 */
export const filterOpportunities = (
  opportunities: FlippingOpportunity[],
  filters: {
    minProfitMargin?: number;
    minVolume?: number;
    confidence?: ('low' | 'medium' | 'high')[];
    trend?: ('up' | 'down' | 'stable')[];
  } = {}
): FlippingOpportunity[] => {
  return opportunities.filter(opp => {
    if (filters.minProfitMargin !== undefined && opp.profitMargin < filters.minProfitMargin) {
      return false;
    }
    
    if (filters.minVolume !== undefined && opp.volume24h < filters.minVolume) {
      return false;
    }
    
    if (filters.confidence && filters.confidence.length > 0 && 
        !filters.confidence.includes(opp.confidence)) {
      return false;
    }
    
    if (filters.trend && filters.trend.length > 0 && 
        !filters.trend.includes(opp.trend)) {
      return false;
    }
    
    return true;
  });
};

/**
 * Obtém estatísticas sobre as oportunidades de flipping
 * @param opportunities Lista de oportunidades
 * @returns Estatísticas agregadas
 */
export const getFlippingStats = (opportunities: FlippingOpportunity[]) => {
  if (opportunities.length === 0) {
    return {
      totalOpportunities: 0,
      avgProfitMargin: 0,
      avgPotentialProfit: 0,
      highConfidenceCount: 0,
      mediumConfidenceCount: 0,
      lowConfidenceCount: 0,
    };
  }
  
  const totalProfitMargin = opportunities.reduce((sum, opp) => sum + opp.profitMargin, 0);
  const totalPotentialProfit = opportunities.reduce((sum, opp) => sum + opp.potentialProfit, 0);
  
  return {
    totalOpportunities: opportunities.length,
    avgProfitMargin: parseFloat((totalProfitMargin / opportunities.length).toFixed(2)),
    avgPotentialProfit: Math.round(totalPotentialProfit / opportunities.length),
    highConfidenceCount: opportunities.filter(opp => opp.confidence === 'high').length,
    mediumConfidenceCount: opportunities.filter(opp => opp.confidence === 'medium').length,
    lowConfidenceCount: opportunities.filter(opp => opp.confidence === 'low').length,
  };
};

// Tipos para os itens do Grand Exchange
export interface GrandExchangeItem {
  id: number;
  name: string;
  icon?: string;
  price?: number;
  change24h?: number;
  change7d?: number;
  volume24h?: number;
  lastUpdated?: Date;
  priceHistory?: PriceData[];
}

export interface PriceData {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface GrandExchangeContextType {
  items: GrandExchangeItem[];
  loading: boolean;
  error: string | null;
  selectedItems: number[];
  addItem: (itemId: number) => Promise<void>;
  removeItem: (itemId: number) => void;
  refreshItems: () => Promise<void>;
  getItemById: (id: number) => GrandExchangeItem | undefined;
}

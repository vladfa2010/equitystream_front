import { apiFetch, extractErrorMessage } from '../http';

/**
 * ТЗ-199: поиск инструментов Finam (только админ; секрет провайдера
 * живёт на сервере и наружу не отдаётся).
 */

export interface InstrumentMatch {
  symbol: string; // ТИКЕР@MIC — авторитетный id
  mic: string;
  ticker: string;
  name: string;
  type: string; // EQUITIES | BONDS | FUTURES | OPTIONS | CURRENCIES | INDICES | ETF
  isin: string | null;
}

export interface InstrumentExchange {
  mic: string;
  name: string;
}

export interface CatalogStatus {
  loaded: boolean;
  loadedAt: string | null;
  expiresAt: string | null;
  count: number;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await apiFetch(endpoint, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(extractErrorMessage(err, res.status));
  }
  return res.json();
}

function unwrap<T>(res: any): T {
  if (res && res.data !== undefined) return res.data as T;
  return res as T;
}

export const marketDataApi = {
  /** Дроплист: тикер/название/ISIN-префикс, q < 2 симв. → пусто (не дёргаем сеть) */
  search: async (q: string): Promise<{ q: string; count: number; matches: InstrumentMatch[] }> => {
    const res = await fetchWithAuth(`/market-data/search?q=${encodeURIComponent(q)}`);
    return unwrap(res);
  },

  /** Точное совпадение тикера → все MIC */
  resolve: async (ticker: string): Promise<{ ticker: string; matches: InstrumentMatch[] }> => {
    const res = await fetchWithAuth(`/market-data/resolve?ticker=${encodeURIComponent(ticker)}`);
    return unwrap(res);
  },

  /** Список бирж (кеш 24 ч на сервере) */
  exchanges: async (): Promise<{ exchanges: InstrumentExchange[] }> => {
    const res = await fetchWithAuth('/market-data/exchanges');
    return unwrap(res);
  },

  /** Состояние кеша каталога, сетью не дёргает */
  assetsStatus: async (): Promise<CatalogStatus> => {
    const res = await fetchWithAuth('/market-data/assets/status');
    return unwrap(res);
  },

  /** Ручной сброс кеша справочника */
  invalidate: async (): Promise<{ invalidated: true }> => {
    const res = await fetchWithAuth('/market-data/cache/invalidate', { method: 'POST' });
    return unwrap(res);
  },
};

/** Человекочитаемые бейджи типа инструмента (ТЗ-199 §3.5) */
export const INSTRUMENT_TYPE_LABELS: Record<string, string> = {
  EQUITIES: 'Stock',
  BONDS: 'Bond',
  FUTURES: 'Futures',
  OPTIONS: 'Option',
  CURRENCIES: 'Currency',
  INDICES: 'Index',
  ETF: 'ETF',
};

/** Алиас MIC → наша биржа (ТЗ-199 §3.6), зеркально бэкенду */
export function micToExchange(mic: string): string {
  switch (mic) {
    case 'MISX': return 'MOEX';
    case 'XNAS':
    case 'XNGS': return 'NASDAQ';
    case 'XNYS': return 'NYSE';
    case 'XASE': return 'AMEX';
    default: return mic;
  }
}

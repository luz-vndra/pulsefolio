export const MARKET_UPDATE_EVENT = 'market:update';

export type MarketUpdate = {
  symbol: 'RELIANCE';
  price: number;
  sequence: number;
  timestamp: string;
};

export interface ServerToClientEvents {
  [MARKET_UPDATE_EVENT]: (update: MarketUpdate) => void;
}

export interface ClientToServerEvents {}

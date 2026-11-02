import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  MARKET_UPDATE_EVENT,
  type ClientToServerEvents,
  type MarketUpdate,
  type ServerToClientEvents,
} from '@pulsefolio/contracts';

type ConnectionState = 'connecting' | 'connected' | 'disconnected';
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function App() {
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const [market, setMarket] = useState<MarketUpdate | null>(null);

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(apiUrl, {
      reconnection: true,
    });

    const onConnect = () => setConnection('connected');
    const onDisconnect = () => setConnection('disconnected');
    const onMarketUpdate = (update: MarketUpdate) => setMarket(update);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(MARKET_UPDATE_EVENT, onMarketUpdate);

    return () => {
      // Remove the exact callbacks registered above, then close this component's connection.
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(MARKET_UPDATE_EVENT, onMarketUpdate);
      socket.disconnect();
    };
  }, []);

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Pulsefolio home">
          <span className="brand-mark">P</span>
          <span>pulsefolio</span>
        </a>
        <span className={`connection connection-${connection}`}>
          <span className="connection-dot" />
          {connection === 'connected' ? 'Live connection' : connection}
        </span>
      </header>

      <section className="intro">
        <p className="eyebrow">MARKET OVERVIEW <span> / </span> SIMULATED FEED</p>
        <h1>Markets, in motion.</h1>
        <p className="subtitle">A real-time ticker, built one event at a time.</p>
      </section>

      <section className="market-card" aria-label="RELIANCE live price">
        <div className="card-topline">
          <div className="asset-heading">
            <div className="asset-icon">R</div>
            <div>
              <h2>Reliance Industries</h2>
              <p>NSE <span className="separator">·</span> RELIANCE</p>
            </div>
          </div>
          <span className="feed-label"><span /> SIMULATED</span>
        </div>

        <div className="price-row">
          <div>
            <p className="field-label">LATEST PRICE <span>INR</span></p>
            <p className="price">{market ? market.price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}</p>
          </div>
          <div className="chart-wrap" aria-hidden="true">
            <div className="chart-grid" />
            <svg viewBox="0 0 330 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#48d6a0" stopOpacity=".25" />
                  <stop offset="100%" stopColor="#48d6a0" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="chart-area" d="M0 76 C24 69 31 81 51 64 S80 73 99 52 S129 61 147 42 S178 57 194 36 S221 44 239 29 S269 43 286 20 S310 28 330 12 V100 H0 Z" />
              <path className="chart-line" d="M0 76 C24 69 31 81 51 64 S80 73 99 52 S129 61 147 42 S178 57 194 36 S221 44 239 29 S269 43 286 20 S310 28 330 12" />
            </svg>
          </div>
        </div>

        <div className="card-footer">
          <div><span className="footer-label">EVENT SEQUENCE</span><strong>{market?.sequence ?? '—'}</strong></div>
          <div className="updated"><span className="footer-label">LAST UPDATED</span><strong>{market ? new Date(market.timestamp).toLocaleTimeString() : 'Waiting for first update'}</strong></div>
          <span className="ticker-symbol">{market?.symbol ?? 'RELIANCE'}</span>
        </div>
      </section>

      <footer className="page-footer">
        <span><span className="footer-pulse" /> Synthetic market data for learning</span>
        <span>WEEK 01 <i>·</i> CONNECTION FUNDAMENTALS</span>
      </footer>
    </main>
  );
}

export default App;

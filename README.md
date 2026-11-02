# Pulsefolio

Pulsefolio is a simulated investment portfolio application built as a 10-week learning project. It uses synthetic market data and simulated funds only; it does not connect to a brokerage or place real trades.

## Week 1: live ticker

The first milestone is a React + TypeScript page receiving one synthetic `RELIANCE` price update each second from an Express + Socket.IO server. The update includes a monotonically increasing sequence and an ISO timestamp. No database or Redux is introduced yet: this keeps attention on the persistent connection and its lifecycle.

### Prerequisites

- Node.js 20 or later
- npm 10 or later

### Run locally

```sh
npm install
npm run dev
```

Open <http://localhost:5173>. The API listens at <http://localhost:4000>; `GET /health` returns a small health response. To use another API URL for the browser, set `VITE_API_URL` before starting the web workspace. The API's browser origin can be changed with `WEB_ORIGIN`, and its port with `PORT`.

To create production bundles, run `npm run build`.

### Connection lifecycle

The browser creates a Socket.IO client in a React effect, subscribes to `connect`, `disconnect`, and `market:update`, and removes those exact listeners and disconnects the socket in the effect cleanup. This matters because React can mount and clean up effects more than once during development; cleanup prevents stale callbacks and duplicate connections.

Socket.IO uses the WebSocket protocol when available and adds named events, acknowledgements, heartbeats, and automatic reconnection. The API owns the synthetic publisher and emits a new update every second. On a server stop, the browser changes to a disconnected state; after the server returns, Socket.IO reconnects automatically. Updates emitted while disconnected are not replayed in Week 1. The sequence makes that gap visible after reconnection; snapshot reconciliation is a later milestone.

### Week 1 verification exercise

1. Start the app and confirm the sequence increments about once per second.
2. Stop the API with Ctrl+C. Confirm the UI says `disconnected`.
3. Start it again with `npm run dev -w @pulsefolio/api`. Confirm the UI reconnects and updates resume.
4. Note the sequence jump after restart. The server restarts its in-memory sequence, so it begins again at 1; durable ordering is not a Week 1 goal.
5. In browser developer tools, check that React remounting does not leave multiple live ticker handlers. React Strict Mode intentionally exercises effect setup and cleanup in development.

The ticker is random synthetic movement, not a market quote. Prices and symbols here are for software learning only.

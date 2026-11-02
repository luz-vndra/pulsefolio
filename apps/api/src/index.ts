import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import {
  MARKET_UPDATE_EVENT,
  type ClientToServerEvents,
  type MarketUpdate,
  type ServerToClientEvents,
} from "@pulsefolio/contracts";

const port = Number(process.env.PORT ?? 4000);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: webOrigin },
});

app.use(cors({ origin: webOrigin }));

app.get("/health", (_request, response) => response.json({ status: "ok" }));

io.on("connection", (socket) => {
  console.info(`Socket connected: ${socket.id}`);
  socket.on("disconnect", (reason) => {
    console.info(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

let sequence = 0;
let price = 2800;

function publishMarketUpdate(): void {
  sequence += 1;
  // A bounded random walk gives us plausible-looking synthetic movement.
  price = Math.max(1, price + (Math.random() - 0.5) * 4);
  const update: MarketUpdate = {
    symbol: "RELIANCE",
    price: Number(price.toFixed(2)),
    sequence,
    timestamp: new Date().toISOString(),
  };
  io.emit(MARKET_UPDATE_EVENT, update);
}

const publisher = setInterval(publishMarketUpdate, 1000);

httpServer.listen(port, () => {
  console.info(`Pulsefolio API listening on http://localhost:${port}`);
});

function shutdown(): void {
  clearInterval(publisher);
  io.close(() => {
    httpServer.close(() => process.exit(0));
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

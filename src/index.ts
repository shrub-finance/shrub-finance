import http from "http";
import cors from "cors";
import morgan from "morgan";
import Express from "express";
import SocketIO from "socket.io";
import { CacheMiddleware } from "./api/middleware";
import { Socket } from "./api/socket";
import { Storage } from "./services/StorageService";
import { ApiRoutes } from "./api";
import { Exchange } from "./services/ContractService";
import util from "util";
import { Orders } from "./services/OrderService";

const wait = util.promisify(setTimeout);

export function Api(port = Number(process.env.API_PORT) || 8000) {
  const app = Express();
  app.use(cors());
  app.use(morgan("tiny"));
  app.use(Express.json());
  app.use(CacheMiddleware());
  app.use(ApiRoutes());

  const server = http.createServer(app);
  let io = SocketIO(server);
  Socket.start(io);
  Exchange.start();
  const host = process.env.HOST;
  if (host) {
    server.listen(port, host, 511, () => {
      console.log("shrub is listening on", host, port);
    });
  } else {
    server.listen(port, () => {
      console.log("shrub is listening on", port);
    });
  }

  return server;
}

async function start() {
  await Storage();
  Api();
  while(true) {
    await wait(10000);
    Orders.pruneExpiredOffers();
  }
}
if (require.main === module) {
  start();
}

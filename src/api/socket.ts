import SocketIO from "socket.io";
import { ObjectId } from "mongodb";
import { OrderModel, IOrder } from "../models/order";

export class SocketService {
  server: SocketIO.Server;

  getCursor(last = new ObjectId()) {
    return OrderModel.collection.find({ _id: { $gt: last } });
  }

  async wireup() {
    let last = new ObjectId();
    const retryCursor = async () => {
      const cursor = this.getCursor(last);
      while (await cursor.hasNext()) {
        const order = await cursor.next();
        if (order) {
          const { baseAsset, quoteAsset, expiry } = order;
          last = new ObjectId();
          this.signalOrder(order);
        }
      }
      setTimeout(retryCursor, 100);
    };
    retryCursor();
  }

  signalOrder(order: IOrder) {
    this.server.in(`baseAsset:${order.baseAsset}`).emit("order", order);

    this.server
      .in(`baseAsset:${order.baseAsset}|quoteAsset:${order.quoteAsset}`)
      .emit("order", order);

    this.server
      .in(
        `baseAsset:${order.baseAsset}|quoteAsset:${order.quoteAsset}|${order.expiry}`
      )
      .emit("order", order);
  }

  start(server: SocketIO.Server) {
    this.server = server;
    this.wireup();
    server.on("connection", (socket) => {
      console.log("new connection", server.sockets.listenerCount, "sockets");
      socket.on("join", async (room) => {
        try {
          const rooms = Object.keys(socket.rooms);
          if (!rooms.includes(room)) {
            socket.join(room);
            console.log(`user joined ${room}`);
            console.log(rooms.length, "active rooms");
          }
        } catch (e) {
          console.log("WS verification error");
        }
      });
    });
  }
}

export const Socket = new SocketService();

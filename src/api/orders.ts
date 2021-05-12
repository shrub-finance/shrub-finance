import Express from "express";
import { Orders } from "../services/OrderService";
import { IOrder } from "../models/order";
export function ExchangeRoutes() {
  const router = Express.Router();

  router.get("/", async (req, res) => {
    const { quoteAsset, baseAsset, expiry } = req.query as Partial<IOrder>;
    const orders = await Orders.getOrders(quoteAsset, baseAsset, expiry);
    return res.json(orders);
  });

  return router;
}

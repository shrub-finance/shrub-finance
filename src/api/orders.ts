import Express from "express";
import { Orders } from "../services/OrderService";
import { IOrder, OrderModel } from "../models/order";

export function OrderRoutes() {
  const router = Express.Router();

  router.get("/", async (req, res) => {
    const { quoteAsset, baseAsset, expiry } = req.query as Partial<IOrder>;
    const orders = await Orders.getOrders(quoteAsset, baseAsset, expiry);
    return res.json(orders);
  });

  router.post("/",  async (req, res) => {
    const order = req.body as IOrder;
    const newOrder = new OrderModel(order);
    try {
      await newOrder.save();
    } catch (e) {
      console.error(e);
      return res.status(400).send(e.message);
    }
    return res.status(200).send('order accepted');
  })

  return router;
}

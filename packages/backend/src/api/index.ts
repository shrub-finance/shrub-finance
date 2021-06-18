import Express from "express";
import { OrderRoutes } from "./orders";
import { CurrencyRoutes } from "./currencies";

export function ApiRoutes() {
  const router = Express.Router();

  router.use("/orders", OrderRoutes());
  router.use("/currencies", CurrencyRoutes());

  return router;
}

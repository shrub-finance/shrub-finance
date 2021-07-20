import Express from "express";
import { OrderRoutes } from "./orders";
import { CurrencyRoutes } from "./currencies";
import { ContractRoutes } from "./contracts";

export function ApiRoutes() {
  const router = Express.Router();

  router.use("/orders", OrderRoutes());
  router.use("/currencies", CurrencyRoutes());
  router.use("/contracts", ContractRoutes());

  return router;
}

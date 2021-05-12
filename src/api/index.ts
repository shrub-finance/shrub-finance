import Express from "express";
import { OrderRoutes } from "./orders";

export function ApiRoutes() {
  const router = Express.Router();

  router.use("/orders", OrderRoutes());

  return router;
}
 

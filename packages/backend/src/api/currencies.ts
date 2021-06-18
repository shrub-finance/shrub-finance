import Express from "express";
import { Config } from "../config";

export function CurrencyRoutes() {
  const router = Express.Router();

  router.get("/", (req, res) => {
    return res.json(Config.currencies);
  });

  return router;
}

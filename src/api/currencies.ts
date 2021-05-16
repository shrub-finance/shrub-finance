import Express from "express";
import config from 'config';
const currencies = config.get('currencies');

export function CurrencyRoutes() {
  const router = Express.Router();

  router.get("/", (req, res) => {
    return res.json(currencies);
  });

  return router;
}

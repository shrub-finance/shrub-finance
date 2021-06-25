import Express from "express";
import {pairExpiryTypeStrike} from "../processOptionContracts";
import {ethers} from "ethers";
import optionContracts from '../option-contracts.json'

export function ContractRoutes() {
  const router = Express.Router();

  router.get("/", async (req, res) => {
    const provider = new ethers.providers.JsonRpcProvider();
    const data = await pairExpiryTypeStrike(provider);
    return res.json(data);
  });

  router.get('/raw', (req, res) => {
    return res.json(optionContracts);
  })

  return router;
}

import Express from "express";
import erc20Abi from '../../blockchain/abis/ERC20.json'
import shrubExchangeAbi from '../../blockchain/abis/ShrubExchange.json'

const mapping = {
  erc20: erc20Abi,
  shrubExchange: shrubExchangeAbi
}

export function ContractRoutes() {
  const router = Express.Router();

  router.get('/', (req, res) => {
    return res.json(Object.keys(mapping));
  })

  router.get("/:contractName", (req, res) => {
    const { contractName } = req.params;
    const abi = mapping[contractName];
    if (!abi) {
      console.log('no abi found');
      return res.status(404).json({ error: 'invalid contract specified'})
    }
    return res.json(abi);
  });

  return router;
}

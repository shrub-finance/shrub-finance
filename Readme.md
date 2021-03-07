# Goal
An options exchange where users can deposit liquidity and write options against their liquidity, or purchase options from others


* Be gas cheap for traders
* Use layer2 when available
* Use onchain governance to
  * Set fees
  * Whitelist pairs
* Allow flashloans of collateral that has been locked


# Installation
```
npm install
npm install -g truffle

# Run ganache-cli in another tab
truffle migrate
```


# Planned Contract Methods
* matchOrders(sellOrder, buyOrder)
  * Should lockup the collateral behind the contract from the user on the sell side
  * Should make the buyer have a balance of the specific contract

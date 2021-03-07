# Goal
An options exchange where users can deposit liquidity and write options against their liquidity, or purchase options from others


* Be gas cheap for traders
* Use layer2 when available
* Use onchain governance to
  * Set fees
  * Whitelist pairs
* Allow flashloans of collateral that has been locked

# Current State
* [Contract Code](contracts/ShrubExchange.sol)
* [Signing Code](backend/test-order.js)

# Examples
* [Example signed data contract](https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.sol)
* [Example signed data client](https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.js)


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

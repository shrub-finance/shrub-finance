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

# Prerequisites

mongo version 4.4+

# Installation
```
# Switch to node version 16 
n 16 # if you have n
npm i 
```

This project uses 'hardhat' (which is installed as a dev dependency)

To improve your hardhad experience follow the steps here: https://hardhat.org/guides/shorthand.html

    # This will allow you to use 'hh' instead of 'npx hardhat' and have completions in your shell

    npm i -g hardhat-shorthand
    hardhat-completion install

Hardhat Commands:

    # To compile contracts and generate typings
    npx hardhat compile

    # To run tests
    npx hardhat test

    # To run a JSON-RPC server on top of hardhat network
    npx hardhat node

    # To deploy the contracts to your local environment:
    npx hardhat run --network localhost scripts/deploy.ts

    # To deploy and fund the shrub accounts (while running the hardhat node in another window)
    # npx hardhat fundAccounts --network localhost
    

# Configuration

create a `.env` file in the project root with the environment variables. use `dotenv.example` as an example

    # Database configuration
    dbHost: process.env.DB_HOST || "localhost",
    dbName: process.env.DB_NAME || "shrub",
    dbPort: process.env.DB_PORT || "27017",

    # API configuration
    host: process.env.HOST || localhost
    port: process.env.API_PORT || 8000


# Planned Contract Methods
* matchOrders(sellOrder, buyOrder)
  * Should lockup the collateral behind the contract from the user on the sell side
  * Should make the buyer have a balance of the specific contract

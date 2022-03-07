# Shrub.finance

An options exchange where users can deposit liquidity and write options against their liquidity, or purchase options from others

[//]: # ()
[//]: # (- Be gas cheap for traders)

[//]: # (- Use layer2 when available)

[//]: # (- Use onchain governance to)

[//]: # (  - Set fees)

[//]: # (  - Whitelist pairs)

[//]: # (- Allow flashloans of collateral that has been locked)

- Website: [shrub.finance](https://shrub.finance/)
- Blog: [Shrub Blog](https://medium.com/@shrubfinance)
- Docs: [docs.shrub.finance](https://docs.shrub.finance)
- Twitter: [@shrubfinance](https://twitter.com/shrubfinance)
- Email: [info@shrub.finance](mailto:info@shrub.finance)
- Discord: [Shrub](https://discord.gg/csusZhYgTg)

# Installation

[//]: # ()
[//]: # (    # Switch to node version 16)

[//]: # (    n 16 # if you have n)

    npm install -g yarn

    yarn

# Configuration

create a `.env` file in both `packages/backend` and `packages/app`. Use `dotenv.example` as an example

    # Database configuration
    dbHost: process.env.DB_HOST || "localhost",
    dbName: process.env.DB_NAME || "shrub",
    dbPort: process.env.DB_PORT || "27017",

    # API configuration
    host: process.env.HOST || localhost
    port: process.env.API_PORT || 8000

# Starting

This project uses `lerna`. All workspaces can be launched and logged in a single terminal window with

    yarn start

To run the workspaces separately:

    yarn contracts                      # Hardhat development blockchain on localhost
    yarn backend                        # API
    yarn app                            # Web app

# Commands and Scripts

Hardhat Commands (These can all be run from the project root):

    yarn hh:compile                     # To compile contracts and generate typings
    yarn hh:check                       # Run linter (solhint)
    yarn hh:test                        # Run contract tests
    yarn hh:gas                         # Run tests with a gas report
    yarn hh:coverage                    # Run coverage on contract tests
    yarn hh:fundAccounts                # Script to fund account[0] and account[1] and deposit MATIC and SUSD into shrub contract
    yarn hh:maker                       # Script to generate orders using announce
    yarn hh:console                     # Console connected to the localhost blockchain (web3 and ethers available along with top level await)

    # To run an arbitrary hardhat command from project root
    yarn workspace @shrub/contracts hardhat COMMAND

    # To run an arbitrary hardhat command from contracts directory
    yarn hardhat COMMAND

Useful scripts:

    yarn script:maker                   # Generates orders and submits them to API
    yarn script:taker                   # Matches an order from the API and executes
    yarn script:deposit                 # deposits 1 MATIC from account[0]



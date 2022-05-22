
Shrub app uses:

- [Chakra UI](https://chakra-ui.com/) for UI building blocks.
- [React Icons](https://react-icons.github.io/react-icons) as icon library

## How to run the project

Use node version > 16

## Configuration

create a `.env` file in the project root with the environment variables. use `dotenv.example` as an example

### Installing

    yarn

### Running server

    yarn start

### Icons

Shrub consumes icons as svgs via Icons.tsx and React Icons. Simply add the svg values there. For multi path svgs, use the array format.

### Testing

    yarn test

Launches the test runner in the interactive watch mode.

### Build for production

    yarn build

Builds the app for production to the `build` folder.

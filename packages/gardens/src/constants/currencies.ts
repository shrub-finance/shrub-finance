export const Currencies = {
  MATIC: {
    name: "Polygon",
    symbol: "MATIC",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    active: true,
    gasCurrency: true,
  },
  SMATIC: {
    name: "Shrub Polygon",
    symbol: "SMATIC",
    address: process.env.REACT_APP_SMATIC_TOKEN_ADDRESS || "",
    decimals: 18,
    active: true,
  },
  SUSD: {
    name: "SUSD",
    symbol: "SUSD",
    address: process.env.REACT_APP_SUSD_TOKEN_ADDRESS || "",
    decimals: 18,
    active: true,
  },
};

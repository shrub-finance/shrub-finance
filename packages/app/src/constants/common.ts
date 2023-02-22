import { toEthDate } from "../utils/ethMethods";

const callsArr = [1.4e6, 1.5e6, 1.7e6, 2e6];
const putsArr = [1.3e6, 1.1e6, 0.9e6, 0.7e6];
const standardStrikes = {
  CALL: callsArr,
  PUT: putsArr,
};

const generator = {
  "SMATIC-SUSD": {
    [toEthDate(new Date("2023-03-02")).toString()]: standardStrikes,
    [toEthDate(new Date("2023-04-02")).toString()]: standardStrikes,
    [toEthDate(new Date("2023-05-02")).toString()]: standardStrikes,
  },
};

export default generator;

// const contractData = {
//   'MATIC-SUSD': {
//     '1634774400': {
//       'CALL': [2000000000, 2500000000, 3000000000],
//       'PUT': [2000000000, 2500000000, 3000000000],
//     },
//     '1635811200': { 'CALL': [2000000000, 2500000000, 3000000000], 'PUT': [2000000000, 2500000000, 3000000000] },
//     '1638403200': { 'CALL': [4000000000], 'PUT': [2000000000] },
//   },
// }

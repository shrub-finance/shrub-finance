import { toEthDate } from "../utils/ethMethods";

const callsArr = [0.8e6, 0.9e6, 1.0e6, 1.2e6];
const putsArr = [0.7e6, 0.6e6, 0.5e6, 0.3e6];
const standardStrikes = {
  CALL: callsArr,
  PUT: putsArr,
};

const generator = {
  "SMATIC-SUSD": {
    [toEthDate(new Date("2022-08-02")).toString()]: standardStrikes,
    [toEthDate(new Date("2022-09-02")).toString()]: standardStrikes,
    [toEthDate(new Date("2022-10-02")).toString()]: standardStrikes,
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

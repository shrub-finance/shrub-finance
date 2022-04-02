import { toEthDate } from "../utils/ethMethods";

const callsArr = [2e6, 2.3e6, 2.5e6, 2.7e6];
const putsArr = [2e6, 1.8e6, 1.6e6, 1.4e6];
const standardStrikes = {
  CALL: callsArr,
  PUT: putsArr,
};

const generator = {
  "SMATIC-SUSD": {
    [toEthDate(new Date("2022-05-02")).toString()]: standardStrikes,
    [toEthDate(new Date("2022-06-02")).toString()]: standardStrikes,
    [toEthDate(new Date("2022-07-02")).toString()]: standardStrikes,
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

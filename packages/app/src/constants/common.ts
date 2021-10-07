import { toEthDate } from '../utils/ethMethods'

const callsArr = [1.3e6, 1.6e6, 2e6];
const putsArr = [1.2e6, 1.0e6, 0.8e6];
const standardStrikes = {
  CALL: callsArr,
  PUT: putsArr,
}


const generator = {
  'SMATIC-SUSD': {
    [toEthDate(new Date('2021-10-15')).toString()] : standardStrikes,
    [toEthDate(new Date('2021-11-02')).toString()] : standardStrikes,
    [toEthDate(new Date('2021-12-02')).toString()] : standardStrikes
  }
}

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

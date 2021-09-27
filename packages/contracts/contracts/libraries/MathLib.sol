pragma solidity 0.7.3;

import "./OrderLib.sol";
import "./FundsLib.sol";

library MathLib {

  // Used to shift price and strike up and down by factors of 1 million
  uint private constant BASE_SHIFT = 1000000;

  function min(uint256 a, uint256 b) internal pure returns (uint256) {
    return a < b ? a : b;
  }

  function adjustWithRatio(uint number, uint partsPerMillion) internal pure returns (uint) {
    return (number * partsPerMillion) / BASE_SHIFT;
  }
}

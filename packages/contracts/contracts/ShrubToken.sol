pragma solidity 0.7.3;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";


contract ShrubToken is ERC20 {
  constructor() ERC20("Shrub Finance", "SHRUB") public {
    _mint(msg.sender, 10000e18);
  }
}

pragma solidity 0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract FakeToken is ERC20 {
  constructor() ERC20("FAKE", "FK") public {
    _mint(msg.sender, 10000e18);
  }
}

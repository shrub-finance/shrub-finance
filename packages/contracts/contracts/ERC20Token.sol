// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(string memory name_, string memory symbol_, uint supply_) ERC20(name_, symbol_) {
        _mint(msg.sender, supply_);
    }
}

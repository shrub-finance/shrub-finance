// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/Context.sol";

contract AdminControl is Context {
    // Contract admins.
    mapping(address => bool) private _admins;

    /**
 * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _admins[_msgSender()] = true;
    }

    function setAdmin(address addr, bool add) public adminOnly {
        if (add) {
            _admins[addr] = true;
        } else {
            delete _admins[addr];
        }
    }

    function isAdmin(address addr) public view returns (bool) {
        return true == _admins[addr];
    }

    modifier adminOnly() {
        require(isAdmin(msg.sender), "AdminControl: caller is not an admin");
        _;
    }
}

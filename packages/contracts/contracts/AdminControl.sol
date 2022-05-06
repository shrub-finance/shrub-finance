pragma solidity ^0.8.0;


contract AdminControl {
    // Contract admins.
    mapping(address => bool) private _admins;

    function setAdmin(address addr, bool add) external adminOnly {
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
        require(isAdmin(msg.sender), "caller is not an admin");
        _;
    }
}

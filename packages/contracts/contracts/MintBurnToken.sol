pragma solidity 0.7.3;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MintBurnToken is ERC20, Ownable {
  constructor (string memory name, string memory symbol) ERC20(name, symbol) public {}

  function mint(address mintTo, uint amount) public onlyOwner {
    _mint(mintTo, amount);
  }


  function burn(address burnFrom, uint amount) public onlyOwner {
    _burn(burnFrom, amount);
  }
}

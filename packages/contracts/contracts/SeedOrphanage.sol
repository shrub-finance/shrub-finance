// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract SeedOrphanage is Ownable, IERC721Receiver {
    // variables
    address public immutable SEED_CONTRACT_ADDRESS;
    address[] adoptionRegistry;
    uint256[] seedList;

    event Add(uint256 tokenId);
    event Remove(uint256 tokenId);
    event ClearRegister();
    event Register(address user);
    event Deliver(uint256 tokenId, address user);

    constructor(address _seedContractAddress) {
        SEED_CONTRACT_ADDRESS = _seedContractAddress;
    }

    function deleteSeedFromList(uint256 _tokenId) private returns (bool) {
        for (uint i = 0; i < seedList.length; i++) {
            if (seedList[i] == _tokenId) {
                seedList[i] = seedList[seedList.length - 1];
                seedList.pop();
                return true;
            }
        }
        return false;
    }

    function addSeed(uint256 _tokenId) public onlyOwner {
        // Adds a seed to the orphanage list and transfers control of the seed to the orphanage
        IERC721(SEED_CONTRACT_ADDRESS).safeTransferFrom(_msgSender(), address(this), _tokenId);
        seedList.push(_tokenId);
        emit Add(_tokenId);
    }

    function removeSeed(uint256 _tokenId) public onlyOwner {
        // Removes a seed from the orphanage list and transfers control of the seed to the owner
        require(IERC721(SEED_CONTRACT_ADDRESS).ownerOf(_tokenId) == address(this), "NFT not present in orphanage");
        IERC721(SEED_CONTRACT_ADDRESS).safeTransferFrom(address(this), _msgSender(), _tokenId);
        deleteSeedFromList(_tokenId);
        emit Remove(_tokenId);
    }

    function clearRegister() public onlyOwner {
        // clears the register list
        delete adoptionRegistry;
        emit ClearRegister();
    }

    function register() public {
        // registers sender to the list
        address account = _msgSender();
//        require(IERC721(SEED_CONTRACT_ADDRESS).balanceOf(account) > 0, "Account holds no seed NFTs");
        require(isRegistered(account) == false, "Account already registered");
        adoptionRegistry.push(account);
        emit Register(account);
    }

    function deliver(uint256 _tokenId, address _receiver) public onlyOwner {
        require(isRegistered(_receiver) == true, "account is not on the registration list");
        require(IERC721(SEED_CONTRACT_ADDRESS).balanceOf(_receiver) > 0, "Account holds no seed NFTs");
        IERC721(SEED_CONTRACT_ADDRESS).safeTransferFrom(address(this), _receiver, _tokenId);
        deleteSeedFromList(_tokenId);
        emit Deliver(_tokenId, _receiver);
    }

    function isRegistered(address _address) public view returns (bool) {
        // returns if a user is registered
        for (uint i = 0; i < adoptionRegistry.length; i++) {
            if (adoptionRegistry[i] == _address) {
                return true;
            }
        }
        return false;
    }

    function getRegister() public view returns (address[] memory) {
        // returns register (may not be necessary)
        return adoptionRegistry;
    }

    function getSeeds() public view returns (uint256[] memory) {
        return seedList;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}

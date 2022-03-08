// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BabyBudAvatar is ERC721URIStorage, Ownable {
    uint public tokenIndex;
    string private CONTRACT_URI;
    constructor() ERC721("Baby Bud Avatars", "BBA") {}

    function burn(uint256 tokenId) public {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
        _burn(tokenId);
    }

    function contractURI() public view returns (string memory) {
        return CONTRACT_URI;
    }

    function setContractURI(string memory _contractUri) public onlyOwner {
        CONTRACT_URI = _contractUri;
    }

    /**
     * @dev Mint and set uri
    */
    function adminMint(address[] calldata addresses, string[] calldata uris) external onlyOwner {
        require(addresses.length == uris.length, "Invalid input");
        for (uint i = 0; i < addresses.length; i++) {
            require(bytes(uris[i]).length != 0, "invalid uri");
            // First token will have tokenId 1
            tokenIndex++;
            _safeMint(addresses[i], tokenIndex, "");
            _setTokenURI(tokenIndex, uris[i]);
        }
    }

    /**
     * @dev Set token uris
     */
    function setTokenURIs(uint256[] calldata tokenIds, string[] calldata uris) external onlyOwner {
        require(tokenIds.length == uris.length, "Invalid input");
        for (uint i = 0; i < tokenIds.length; i++) {
            require(bytes(uris[i]).length != 0, "invalid uri");
            _setTokenURI(tokenIds[i], uris[i]);
        }
    }
}

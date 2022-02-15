// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
//import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract PaperPot is Ownable, IERC721Receiver, ERC1155 {
    // This is multiple to handle possibility of future seed series
    address[] public SEED_CONTRACT_ADDRESSES;
    uint constant POT_TOKENID = 1;
    uint constant FERTILIZER_TOKENID = 2;
    uint constant WATER_TOKENID = 3;
    address constant BURN_ADDRESS = 0x000000000000000000000000000000000000dead;
    uint constant POTTED_PLANT_BASE_TOKENID = 1000000;
    uint constant SHRUB_BASE_TOKENID = 2000000;

    uint pottedPlantCurrentIndex = 1;
    uint shrubCurrentIndex = 1;

    struct Growth {
        uint16 growthBps;   // 0 to 10000
        uint lastWatering;  // timestamp of the last watering
    }

    // Valid seedContractAddresses
    mapping(address => bool) private _seedContractAddresses;

    // True indicates sad seed
    mapping(uint => bool) private _sadSeeds;

    // indicates growth state of a potted plant
    mapping(uint => Growth) private _growthState;

    // Constructor
    constructor(address[] seedContractAddresses, uint[] sadSeeds) {}


// Public Write Functions
    function plant(address _seedContractAddress, uint _seedTokenId) public {
        // Pot is decremented from msg_sender()
        // Seed with _seedTokenId gets transferred to the Zero address (burned)
        // Mint new potted plant with tokenId POTTED_PLANT_BASE_TOKENID + pottedPlantCurrentIndex
        // Save metadata of potted plant
        // increment pottedPlantCurrentIndex

        // _seedContractAddress must be valid
        require(_seedContractAddresses[_seedContractAddress] == true, "Invalid seedContractAddress");
        // must own a pot
        require(balanceOf(_msgSender(), POT_TOKENID) > 0, "Must own a pot token to plant");
        // must own the specified seed
        require(IERC721(_seedContractAddress).ownerOf(_seedTokenId) == _msgSender(), "Must own seed to plant");
        // Pot is decremented from msg_sender()
        _burn(_msgSender(), POT_TOKENID, 1);
        // Seed with _seedTokenId gets transferred to the Zero address (burned)
        IERC721(_seedContractAddress).transferFrom()

        // Mint new potted plant with tokenId POTTED_PLANT_BASE_TOKENID + pottedPlantCurrentIndex
        // Save metadata of potted plant
        // increment pottedPlantCurrentIndex

        require(_isOwner(_msgSender(), _tokenId), "Must own the PaperPot token to plant");
        require(!isPlanted, "A seed has already been planted in this pot");
        // Determine the owner of the seed token
        address seedOwner = IERC721(SEED_CONTRACT_ADDRESS).ownerOf(_seedTokenId);
        // Burn the seed by sending it to the Zero address
        IERC721(SEED_CONTRACT_ADDRESS).transferFrom(seedOwner, Address(0), _seedTokenId);
        plantedSeedId[_tokenId] = _seedTokenId;
        growthBps[_tokenId] = 0;
    }
    function plantAndMakeHappy(uint _seedTokenId) public {
        // Update the sad metadata for _seedTokenId
        // run plant
    }
    function water(uint[] _tokenIds) public {
        // Watering may be called once per day
        // Watering must take place > 8 hours since previous watering
    }
    function waterWithFertilizer(uint[] _tokenIds) public {}
    function harvest(uint _tokenId) public {}
    function receiveWaterFromFaucet(address _receiver) public {}

    // Public Read Functions
    function eligibleForWatering(uint[] _tokenIds) returns (bool eligible) {

        return false;
    }

    // Sale
    function purchasePot(uint count) {}

    // Owner Write Functions
    function addSeedContractAddress(address _seedContractAddress) public onlyOwner {}
    function adminMintPot() public onlyOwner {}
    function adminDistributeWater() public onlyOwner {}
    function adminDistributeFertilizer() public onlyOwner {}
}

// We may give the user upon planting to add a quote


// tokenId 1 - Pot
// tokenId 2 - Fertilizer
// tokenId 3 - Water
// tokenId 1000000+ - Potted Plants
// tokenId 2000000+ - Shrubs
/*
contract PaperPot is Ownable, IERC721Receiver, ERC721 {
    // variables
    address public immutable SEED_CONTRACT_ADDRESS;
    address[] adoptionRegistry;
    uint256[] seedList;
    uint public plantedSeeds;
    uint public totalPots;

    mapping(address => bool) registrationMap;

    event Plant(uint256 tokenId, uint256 seedTokenId);
    event Grow(uint256 tokenId, uint256 newGrowth);



    mapping(uint256 => uint256) plantedSeedId;
    mapping(uint256 => uint256) growthBps;
    mapping(uint256 => bool) sadSeeds;

    constructor(address _seedContractAddress) {
        SEED_CONTRACT_ADDRESS = _seedContractAddress;
    }

    function _isOwner(address account, uint256 tokenId) internal view virtual returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address owner = ERC721.ownerOf(tokenId);
        return account == owner;
    }

    function isPlanted(uint256 _tokenId) public view returns (bool) {
        require(_exists(_tokenId), "ERC721: operator query for nonexistent token");
        return plantedSeedId[_tokenId] != null;
    }

    function seedIdInRange(uint256 _seedTokenId) private view returns (bool) {
        return _seedTokenId > 0 && _seedTokenId < 10001;
    }

    function getIsSadFromSeedId(uint256 _seedTokenId) private view returns (bool) {
        require(seedIdInRange(_seedTokenId), "seedTokenId not in range");
        if (!sadSeeds[_seedTokenId]) {
            return false;
        }
        return sadSeeds[_seedTokenId];
    }

    function getClassFromSeedId(uint256 _seedTokenId) private pure returns (string class) {
        require(seedIdInRange(_seedTokenId), "seedTokenId not in range");
        if (_seedTokenId > 1110) {
            return "wonder";
        }
        if (_seedTokenId > 110) {
            return "passion";
        }
        if (_seedTokenId > 10) {
            return "hope";
        }
        return "power";
    }

    function getDnaFromSeedId(uint256 _seedTokenId) private pure returns (uint256 dna) {
        require(seedIdInRange(_seedTokenId), "seedTokenId not in range");
        return _seedTokenId % 100;
    }

    function plantSeed(uint256 _tokenId, uint256 _seedTokenId) public {
        require(_isOwner(_msgSender(), _tokenId), "Must own the PaperPot token to plant");
        require(!isPlanted, "A seed has already been planted in this pot");
        // Determine the owner of the seed token
        address seedOwner = IERC721(SEED_CONTRACT_ADDRESS).ownerOf(_seedTokenId);
        // Burn the seed by sending it to the Zero address
        IERC721(SEED_CONTRACT_ADDRESS).transferFrom(seedOwner, Address(0), _seedTokenId);
        plantedSeedId[_tokenId] = _seedTokenId;
        growthBps[_tokenId] = 0;
    }

    function water() {}

    function waterWithFertilizer() {}

    function bulkWater() {}

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}*/

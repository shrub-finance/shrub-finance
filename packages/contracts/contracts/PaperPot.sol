// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
//import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "./JsonBuilder.sol";
//import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract PaperPot is Ownable, ERC1155, JsonBuilder {
    // This is multiple to handle possibility of future seed series
    address[] public SEED_CONTRACT_ADDRESSES;
    uint constant POT_TOKENID = 1;
    uint constant FERTILIZER_TOKENID = 2;
    uint constant WATER_TOKENID = 3;
    address constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint constant POTTED_PLANT_BASE_TOKENID = 10 ** 6;
    uint constant SHRUB_BASE_TOKENID = 2 * 10 ** 6;
    bytes4 constant ERC1155ID = 0xd9b67a26;

    bool public mintingPaused = true;

    uint public pottedPlantCurrentIndex = 0;
    uint public shrubCurrentIndex = 0;
    uint private waterNonce = 0;

    struct Growth {
        uint16 growthBps;   // 0 to 10000
        uint lastWatering;  // timestamp of the last watering
    }

    // Valid seedContractAddresses
    mapping(address => bool) private _seedContractAddresses;

    // True indicates sad seed
    // IMPORTANT: even though it is possible to add new seed contract addresses tokenIds must not be reused
    mapping(uint256 => bool) private _sadSeeds;

    // seed planted in potted plant (tokenId, seedTokenId)
    mapping(uint => uint) private _plantedSeed;

    // indicates growth state of a potted plant
    mapping(uint => Growth) private _growthState;

    event Grow(uint tokenId, uint16 growthAmount, uint16 growthBps);
    event Plant(uint256 tokenId, uint256 seedTokenId, address account);

    // Constructor
    constructor(address[] memory seedContractAddresses, uint[] memory sadSeeds, string memory _uri) ERC1155(_uri) {
        require(seedContractAddresses.length > 0, "Must be at least 1 seedContractAddress");
        for (uint i = 0; i < seedContractAddresses.length; i++) {
            _seedContractAddresses[seedContractAddresses[i]] = true;
            SEED_CONTRACT_ADDRESSES.push(seedContractAddresses[i]);
        }
        for (uint i = 0; i < sadSeeds.length; i++) {
            _sadSeeds[sadSeeds[i]] = true;
        }
    }

    // Public Read Functions
    function uri(uint _tokenId) public view override returns (string memory) {
        // use the baseUri for the pots, water, and fertilizer
        if (_tokenId > 0 && _tokenId < 4) {
            return ERC1155.uri(_tokenId);
        }
        require(_tokenId > POTTED_PLANT_BASE_TOKENID && _tokenId < 3 * 10 ** 6, "tokenId out of range");
        return _tokenId < SHRUB_BASE_TOKENID ? generatePottedPlantMetadata(_tokenId) : generateShrubMetadata(_tokenId);
    }

    function generatePottedPlantMetadata(uint _tokenId) private view returns (string memory) {
        return "application/json";
    }

    function generateShrubMetadata(uint _tokenId) private view returns (string memory) {
        return "application/json";
    }


// Public Write Functions
    function plant(address _seedContractAddress, uint _seedTokenId) public returns(uint) {
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
        IERC721(_seedContractAddress).transferFrom(_msgSender(), BURN_ADDRESS, _seedTokenId);
        // increment pottedPlantCurrentIndex
        pottedPlantCurrentIndex++;
        // Mint new potted plant with tokenId POTTED_PLANT_BASE_TOKENID + pottedPlantCurrentIndex
        uint tokenId = POTTED_PLANT_BASE_TOKENID + pottedPlantCurrentIndex;
        _mint(_msgSender(), tokenId, 1, new bytes(0));
        // Save metadata of potted plant
        _plantedSeed[tokenId] = _seedTokenId;
        // Set initial growth state of potted plant
        _growthState[tokenId] = Growth({
            growthBps: 0,
            lastWatering: 1             // Initialized to 1 to differentiate from uninitialized
        });
        emit Plant(tokenId, _seedTokenId, _msgSender());
        return tokenId;
    }

    function plantAndMakeHappy(address _seedContractAddress, uint _seedTokenId) payable public {
        // User must pay 1 MATIC to make the seed happy
        require(msg.value == 1, "Incorrect payment amount");
        // Ensure that the seed is sad
        require(_sadSeeds[_seedTokenId] == true, "Seed already happy");
        // run plant
        plant(_seedContractAddress, _seedTokenId);
        // Update the sad metadata for _seedTokenId
        _sadSeeds[_seedTokenId] = false;
    }
    function water(uint[] memory _tokenIds) public {
        require(eligibleForWatering(_tokenIds), "provided tokenIds not eligible");
        // Loop through and water each plant
        for (uint i = 0; i < _tokenIds.length; i++) {
            require(balanceOf(_msgSender(), _tokenIds[i]) > 0, "Potted plant not owned by sender");
            uint16 relativeGrowth;
            waterNonce++;
            if (_sadSeeds[_plantedSeed[_tokenIds[i]]] == true) {
                // Case: Sad Potted Plant (100-175)
                relativeGrowth = getRandomInt(75, 100, waterNonce);
            } else {
                // Case: Happy Potted Plant (200-350)
                relativeGrowth = getRandomInt(150, 200, waterNonce);
            }
            _growPlant(_tokenIds[i], relativeGrowth);
        }
    }

    function waterWithFertilizer(uint[] memory _tokenIds) public {
        require(eligibleForWatering(_tokenIds), "provided tokenIds not eligible");
        // Burn the fertilizer
        _burn(_msgSender(), FERTILIZER_TOKENID, _tokenIds.length);
        // Loop through and water each plant
        for (uint i = 0; i < _tokenIds.length; i++) {
            require(balanceOf(_msgSender(), _tokenIds[i]) > 0, "Potted plant not owned by sender");
            uint16 relativeGrowth;
            waterNonce++;
            if (_sadSeeds[_plantedSeed[_tokenIds[i]]] == true) {
                // Case: Sad Potted Plant with Fertilizer (150-263)
                relativeGrowth = getRandomInt(113, 150, waterNonce);
            } else {
                // Case: Happy Potted Plant with Fertilizer (300-525)
                relativeGrowth = getRandomInt(225, 300, waterNonce);
            }
            _growPlant(_tokenIds[i], relativeGrowth);
        }
    }

    function _growPlant(uint _tokenId, uint16 growthAmount) private returns (uint growthBps) {
        if (_growthState[_tokenId].growthBps + growthAmount > 10000) {
            emit Grow(_tokenId, 10000 - _growthState[_tokenId].growthBps, 10000);
            _growthState[_tokenId].growthBps = 10000;
        } else {
            _growthState[_tokenId].growthBps += growthAmount;
            emit Grow(_tokenId, growthAmount, _growthState[_tokenId].growthBps);
        }
        _growthState[_tokenId].lastWatering = block.timestamp;
        return _growthState[_tokenId].growthBps;
    }

    function harvest(uint _tokenId) public {
    }

    function receiveWaterFromFaucet(address _receiver) public {}

    // Public Read Functions
    function eligibleForWatering(uint[] memory _tokenIds) public view returns (bool eligible) {
        for (uint i = 0; i < _tokenIds.length; i++) {
            Growth memory potGrowth = _growthState[_tokenIds[i]];
            if (potGrowth.lastWatering == 0) {
                return false;
            }
            // Check if timestamp is more than 8 hours ago
            if (block.timestamp < potGrowth.lastWatering + 8 hours) {
                return false;
            }
            // Check that timestamp is from previous day
            if (block.timestamp / 1 days == potGrowth.lastWatering / 1 days) {
                return false;
            }
        }
        return true;
    }

    function getPlantedSeed(uint _tokenId) public view returns (uint seedTokenId) {
        return _plantedSeed[_tokenId];
    }

    function getGrowthLevel(uint _tokenId) public view returns (uint) {
        return _growthState[_tokenId].growthBps;
    }

    function getLastWatering(uint _tokenId) public view returns (uint) {
        return _growthState[_tokenId].growthBps;
    }

//    function getGrowthLevel(uint[] memory _tokenIds) public view returns (uint[] memory) {
//        uint[] memory growthBpsResults;
//        for (uint i = 0; i < _tokenIds.length; i++) {
//            growthBpsResults.push(_growthState[_tokenIds[i]].growthBps);
//        }
//        return growthBpsResults;
//    }
//
//    function getLastWatering(uint[] memory _tokenIds) public view returns (uint[] memory) {
//        uint[] memory lastWateringResults;
//        for (uint i = 0; i < _tokenIds.length; i++) {
//            lastWateringResults.push(_growthState[_tokenIds[i]].lastWatering);
//        }
//        return lastWateringResults;
//    }

    // Sale
    function purchasePot(uint count) public {
        require(!mintingPaused, "Minting is not active");
    }

    // Owner Write Functions
    function addSeedContractAddress(address _seedContractAddress) public onlyOwner {
        // TODO: Add a sanity check that this address has an ERC721 contract
        require(_seedContractAddresses[_seedContractAddress] == false, "address already on seedContractAddresses");
        require(ERC165Checker.supportsInterface(_seedContractAddress, type(IERC721).interfaceId), "not a valid ERC-721 implementation");
        SEED_CONTRACT_ADDRESSES.push(_seedContractAddress);
        _seedContractAddresses[_seedContractAddress] = true;
    }

    function removeSeedContractAddress(address _seedContractAddress) public onlyOwner {
        require(_seedContractAddresses[_seedContractAddress] == true, "address not on seedContractAddresses");
        _seedContractAddresses[_seedContractAddress] = false;
        for (uint i = 0; i < SEED_CONTRACT_ADDRESSES.length; i++) {
            if (SEED_CONTRACT_ADDRESSES[i] == _seedContractAddress) {
                SEED_CONTRACT_ADDRESSES[i] = SEED_CONTRACT_ADDRESSES[SEED_CONTRACT_ADDRESSES.length - 1];
                SEED_CONTRACT_ADDRESSES.pop();
                return;
            }
        }
    }

    function adminMintPot(address _to, uint _amount) public onlyOwner {
        _mint(_to, POT_TOKENID, _amount, new bytes(0));
    }

    function adminDistributeWater(address _to, uint _amount) public onlyOwner {
        _mint(_to, WATER_TOKENID, _amount, new bytes(0));
    }

    function adminDistributeFertilizer(address _to, uint _amount) public onlyOwner {
        _mint(_to, FERTILIZER_TOKENID, _amount, new bytes(0));
    }

    function setUri(string calldata newUri) public onlyOwner {
        _setURI(newUri);
    }

    // Helper private functions

    function getRandomInt(uint16 _range, uint16 _min, uint _nonce) private view returns (uint16) {
        return uint16(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, _nonce))) % _range) + _min;
    }
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

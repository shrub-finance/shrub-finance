// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
//import "@openzeppelin/contracts/access/Ownable.sol";
//import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./ERC1155URIStorageSrb.sol";
import "./AdminControl.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./JsonBuilder.sol";
import "hardhat/console.sol";

import {IPaperPotMetadata} from "./PaperPotMetadata.sol";
import "./PaperPotEnum.sol";


contract PaperPot is AdminControl, ERC1155, ERC1155Supply, ERC1155URIStorageSrb, JsonBuilder {
    IPaperPotMetadata public _metadataGenerator;
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
    uint private NFTTicketTokenId;
    address private NFTTicketAddress;

    uint public pottedPlantCurrentIndex = 0;
    uint public shrubCurrentIndex = 0;
    uint private waterNonce = 0;

    struct Growth {
        uint16 growthBps;   // 0 to 10000
        uint lastWatering;  // timestamp of the last watering
    }

    using Strings for uint256;

    // Valid seedContractAddresses
    mapping(address => bool) private _seedContractAddresses;

    // True indicates sad seed
    // IMPORTANT: even though it is possible to add new seed contract addresses tokenIds must not be reused
    mapping(uint256 => bool) private _sadSeeds;

    // seed planted in potted plant (tokenId, seedTokenId)
    mapping(uint => uint) private _plantedSeed;

    // seed that shrub is based on (tokenId, seedTokenId)
    mapping(uint => uint) private _shrubBaseSeed;

    // indicates growth state of a potted plant
    mapping(uint => Growth) private _growthState;

    // indicates order number of a potted plant (only increases)
    mapping(uint => uint) private _pottedPlantNumber;

    // default uri for shrubs based on class
    mapping(NftClass => string) private _shrubDefaultUris;

    // uri for shrubs based on seedTokenId
    mapping(uint => string) private _shrubSeedUris;

    // indicates number of each class of potted plant
    // uint8 class => uint count of potted plants minted of that class (only increases)
    mapping(NftClass => uint) public pottedPlantsByClass;

    // Royalties.
    bytes4 private constant _INTERFACE_ID_EIP2981 = 0x2a55205a;
    mapping(uint256 => address payable) internal _royaltiesReceivers;
    mapping(uint256 => uint256) internal _royaltiesBps;


    event Grow(uint tokenId, uint16 growthAmount, uint16 growthBps);
    event Plant(uint256 tokenId, uint256 seedTokenId, address account);
    event Happy(uint256 tokenId);
    event Harvest(uint256 pottedPlantTokenId, uint256 shrubTokenId, address account);

// Constructor
    constructor(
        address[] memory seedContractAddresses,
        uint[] memory sadSeeds,
        string[] memory resourceUris_,
        string[] memory shrubDefaultUris_,
        address metadataGenerator_
    ) ERC1155("") {
        require(seedContractAddresses.length > 0, "Must be at least 1 seedContractAddress");
        require(resourceUris_.length == 3, "must be 3 uris - pot, fertilizer, water");
        require(shrubDefaultUris_.length == 4, "must be 4 uris - wonder, passion, hope, power");
        // setup the initial admin as the contract deployer
        setAdmin(_msgSender(), true);
        // Set the uri for pot, fertilizer, water
        for (uint i = 0; i < resourceUris_.length; i++) {
            _setURI(i + 1, resourceUris_[i]);
        }
        for (uint8 i = 0; i < shrubDefaultUris_.length; i++) {
            _shrubDefaultUris[NftClass(i)] = shrubDefaultUris_[i];
        }
        for (uint i = 0; i < seedContractAddresses.length; i++) {
            _seedContractAddresses[seedContractAddresses[i]] = true;
            SEED_CONTRACT_ADDRESSES.push(seedContractAddresses[i]);
        }
        for (uint i = 0; i < sadSeeds.length; i++) {
            _sadSeeds[sadSeeds[i]] = true;
        }
        _metadataGenerator = IPaperPotMetadata(metadataGenerator_);
    }

    // Receive Function


    // Fallback Function

    // External Functions

    function plantAndMakeHappy(address _seedContractAddress, uint _seedTokenId) payable public {
        // User must pay 1 MATIC to make the seed happy
        require(msg.value == 1 ether, "PaperPot: Incorrect payment amount");
        // Ensure that the seed is sad
        require(_sadSeeds[_seedTokenId] == true, "PaperPot: Seed already happy");
        // run plant
        uint pottedPlantTokenId = plant(_seedContractAddress, _seedTokenId);
        // emit happy event
        emit Happy(pottedPlantTokenId);
        // Update the sad metadata for _seedTokenId
        _sadSeeds[_seedTokenId] = false;
    }

    function _water(uint[] memory _tokenIds, bool fertilizer) internal {
//        console.log("_water");
//        console.log(_tokenIds.length);
//        console.log(_tokenIds[0]);
//        console.log(fertilizer);
//        console.log(_tokenIds[1]);
        // Burn the water
//        console.log(_msgSender());
//        console.log(WATER_TOKENID);
//        console.log(_tokenIds.length);
//        console.log(balanceOf(_msgSender(), WATER_TOKENID));
        _burn(_msgSender(), WATER_TOKENID, _tokenIds.length);
//        console.log("hehe");
        if (fertilizer) {
            // Burn the fertilizer
            _burn(_msgSender(), FERTILIZER_TOKENID, _tokenIds.length);
        }
        // Loop through and water each plant
//        console.log("here");
        for (uint i = 0; i < _tokenIds.length; i++) {
            // TODO: JUST FOR TESTING UNCOMMENT THIS
//            require(_eligibleForWatering(_tokenIds[i]), "PaperPot: provided tokenIds not eligible");
            require(balanceOf(_msgSender(), _tokenIds[i]) > 0, "PaperPot: Potted plant not owned by sender");
            waterNonce++;
//            console.log("here2");
            uint16 relativeGrowth = fertilizer ? (
                _sadSeeds[_plantedSeed[_tokenIds[i]]] ?
                    getRandomInt(113, 150, waterNonce) :  // Case: Sad Potted Plant with Fertilizer (150-263)
                    getRandomInt(225, 300, waterNonce)    // Case: Happy Potted Plant with Fertilizer (300-525)
            ) : (
                _sadSeeds[_plantedSeed[_tokenIds[i]]] ?
                    getRandomInt(75, 100, waterNonce) :   // Case: Sad Potted Plant (100-175)
                    getRandomInt(150, 200, waterNonce)    // Case: Happy Potted Plant (200-350)
            );
//            console.log("here3");
            _growPlant(_tokenIds[i], relativeGrowth);
        }
    }

    function water(uint[] calldata _tokenIds) external {
//        console.log("water");
        _water(_tokenIds, false);
    }

    function waterWithFertilizer(uint[] calldata _tokenIds) external {
//        console.log("waterWithFertilezer");
        _water(_tokenIds, true);
    }

    function harvest(uint _tokenId) external {
        // Ensure that tokenId is eligible for Harvest
        require(_growthState[_tokenId].growthBps == 10000, "PaperPot: Not eligible for harvest");
        // Ensure that tokenId is owned by caller
        require(balanceOf(_msgSender(), _tokenId) > 0, "PaperPot: Potted plant not owned by sender");
        // burn the potted plant
        _burn(_msgSender(), _tokenId, 1);
        // increment shrubCurrentIndex;
        shrubCurrentIndex++;
        uint shrubTokenId = SHRUB_BASE_TOKENID + shrubCurrentIndex;
        // set metadata for shrub
        _shrubBaseSeed[shrubTokenId] = _plantedSeed[_tokenId];
        // mint the shrub to the caller
        _mint(_msgSender(), shrubTokenId, 1, new bytes(0));
        emit Harvest(_tokenId, shrubTokenId, _msgSender());
    }

    function receiveWaterFromFaucet(address _receiver) external {}

    // Owner Write Functions
    function setNftTicketInfo(uint NFTTicketTokenId_, address NFTTicketAddress_) external adminOnly {
        NFTTicketTokenId = NFTTicketTokenId_;
        NFTTicketAddress = NFTTicketAddress_;
    }

function addSeedContractAddress(address _seedContractAddress) external adminOnly {
        // TODO: Add a sanity check that this address has an ERC721 contract
        require(_seedContractAddresses[_seedContractAddress] == false, "address already on seedContractAddresses");
        require(ERC165Checker.supportsInterface(_seedContractAddress, type(IERC721).interfaceId), "not a valid ERC-721 implementation");
        SEED_CONTRACT_ADDRESSES.push(_seedContractAddress);
        _seedContractAddresses[_seedContractAddress] = true;
    }

    function removeSeedContractAddress(address _seedContractAddress) external adminOnly {
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

    function adminMintPot(address _to, uint _amount) external adminOnly {
        _mint(_to, POT_TOKENID, _amount, new bytes(0));
    }

    function unpauseMinting() external adminOnly {
        mintingPaused = false;
    }

    function pauseMinting() external adminOnly {
        mintingPaused = true;
    }

    function mintFromTicket(address _to, uint _amount, uint ticketTokenId) external returns (bool) {
        require(mintingPaused == false, "PaperPot: minting paused");
        require(ticketTokenId == NFTTicketTokenId, "PaperPot: invalid ticket tokenId");
        require(_msgSender() == NFTTicketAddress, "PaperPot: invalid sender");
        _mint(_to, POT_TOKENID, _amount, new bytes(0));
        return true;
    }

    function adminDistributeWater(address _to, uint _amount) external adminOnly {
        _mint(_to, WATER_TOKENID, _amount, new bytes(0));
    }

    function adminDistributeFertilizer(address _to, uint _amount) external adminOnly {
        _mint(_to, FERTILIZER_TOKENID, _amount, new bytes(0));
    }

    function adminSetSadSeeds(uint[] memory seedTokenIds, bool[] memory isSads) external adminOnly {
        require(seedTokenIds.length == isSads.length, "seedTokenIds and isSads must be equal length");
        for (uint i = 0; i < seedTokenIds.length; i++) {
            _sadSeeds[seedTokenIds[i]] = isSads[i];
        }
    }

    function setURI(uint tokenId_, string calldata tokenURI_) external adminOnly {
        _setURI(tokenId_, tokenURI_);
    }

    function setShrubSeedUris(uint[] calldata seedTokenIds_, string[] calldata uris_) external adminOnly {
        require(seedTokenIds_.length == uris_.length, "PaperPot: seedTokenIds and uris must be same length");
        for (uint i = 0; i < seedTokenIds_.length; i++) {
            require(seedTokenIds_[i] < POTTED_PLANT_BASE_TOKENID, "PaperPot: invalid seedTokenId");
            _shrubSeedUris[seedTokenIds_[i]] = uris_[i];
        }
    }

    function setMetadataGenerator(address metadataGenerator_) external adminOnly {
        require(ERC165Checker.supportsInterface(metadataGenerator_, type(IPaperPotMetadata).interfaceId), "PaperPot: not a valid IPaperPotMetadata implementation");
        _metadataGenerator = IPaperPotMetadata(metadataGenerator_);
    }

    // External View

    function getPlantedSeed(uint _tokenId) external view validPottedPlant(_tokenId) returns (uint seedTokenId) {
        return _plantedSeed[_tokenId];
    }

    function getGrowthLevel(uint _tokenId) external view validPottedPlant(_tokenId) returns (uint) {
        return _growthState[_tokenId].growthBps;
    }

    function getLastWatering(uint _tokenId) external view validPottedPlant(_tokenId) returns (uint) {
        return _growthState[_tokenId].lastWatering;
    }

    function eligibleForWatering(uint[] calldata _tokenIds) external view returns (bool eligible) {
        for (uint i = 0; i < _tokenIds.length; i++) {
            _validPottedPlant(_tokenIds[i]);
            // Check for duplicates
            for (uint j = 0; j < i; j++) {
                require(_tokenIds[j] != _tokenIds[i], "PaperPot: duplicate tokenId");
            }
            if (_eligibleForWatering(_tokenIds[i]) == false) {
                return false;
            }
        }
        return true;
    }

    function isSeedSad(uint seedTokenId_) external view returns (bool) {
        return _sadSeeds[seedTokenId_];
    }

    // Public Functions

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
        NftClass class = getClassFromSeedId(_seedTokenId);
        pottedPlantsByClass[class]++;
        // Mint new potted plant with tokenId POTTED_PLANT_BASE_TOKENID + pottedPlantCurrentIndex
        uint tokenId = POTTED_PLANT_BASE_TOKENID + pottedPlantCurrentIndex;
        _mint(_msgSender(), tokenId, 1, new bytes(0));
        _pottedPlantNumber[tokenId] = pottedPlantsByClass[class];
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

    function uri(uint _tokenId) public view override(ERC1155, ERC1155URIStorageSrb) returns (string memory) {
        require(exists(_tokenId), "PaperPot: URI query for nonexistent token");
//        console.log(_tokenId);
        // use the baseUri for the pots, water, and fertilizer
        if (_tokenId > 0 && _tokenId < 4) {
            return super.uri(_tokenId);
        }
//        console.log(POTTED_PLANT_BASE_TOKENID);
//        console.log(3 * 10 ** 6);
        string memory storageUri = super.uri(_tokenId);
        if (bytes(storageUri).length > 0) {
            return storageUri;
        }
        // Check if there is a shrub uri based on seedTokenId
        uint seedTokenId = _shrubBaseSeed[_tokenId];
        if (seedTokenId != 0) {
            string memory shrubSeedUri = _shrubSeedUris[seedTokenId];
            if (bytes(shrubSeedUri).length > 0) {
                return shrubSeedUri;
            }
        }
        if (_tokenId < SHRUB_BASE_TOKENID) {
            //            string memory shrubClass = getClassFromSeedId(_plantedSeed[_tokenId]);
            return generatePottedPlantMetadata(_tokenId);
        }
        NftClass class = getClassFromSeedId(_shrubBaseSeed[_tokenId]);
        return _shrubDefaultUris[class];
    }

    // Internal Functions

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        if (from != address(0)) {
            // sufficient balance check can be skipped for minting
            for (uint i = 0; i < ids.length; i++) {
                require(balanceOf(from, ids[i]) >= amounts[i], "PaperPot: Insufficient balance");
            }
        }
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _eligibleForWatering(uint tokenId) internal view returns (bool) {
        Growth memory potGrowth = _growthState[tokenId];
        require(potGrowth.lastWatering != 0, "PaperPot: ineligible tokenId");
        // Check if timestamp is more than 8 hours ago
        if (block.timestamp < potGrowth.lastWatering + 8 hours) {
            return false;
        }
        // Check that timestamp is from previous day
        if (block.timestamp / 1 days == potGrowth.lastWatering / 1 days) {
            return false;
        }
        return true;
    }

    // Private Functions

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

    function generatePottedPlantMetadata(uint _tokenId) private view returns (string memory) {
        return _metadataGenerator.tokenMetadata(
            getPottedPlantName(_tokenId),
            _plantedSeed[_tokenId],
            _growthState[_tokenId].growthBps,
            _sadSeeds[_tokenId]
        );
    }

    function getPottedPlantName(uint _tokenId) private view returns (string memory) {
        NftClass class = getClassFromSeedId(_plantedSeed[_tokenId]);
        string memory className = class == NftClass.wonder ? "Wonder" :
        class == NftClass.passion ? "Passion" :
        class == NftClass.hope ? "Hope" : "Power";
        return string(abi.encodePacked('Potted Plant of ',className,' #',_pottedPlantNumber[_tokenId].toString()));
    }

    function getRandomInt(uint16 _range, uint16 _min, uint _nonce) private view returns (uint16) {
        return uint16(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, _nonce))) % _range) + _min;
    }

    function seedIdInRange(uint256 _seedTokenId) private pure returns (bool) {
        return _seedTokenId > 0 && _seedTokenId < 10001;
    }

    function getClassFromSeedId(uint256 _seedTokenId) private pure returns (NftClass) {
        require(seedIdInRange(_seedTokenId), "seedTokenId not in range");
        if (_seedTokenId > 1110) {
            return NftClass.wonder;
        }
        if (_seedTokenId > 110) {
            return NftClass.passion;
        }
        if (_seedTokenId > 10) {
            return NftClass.hope;
        }
        return NftClass.power;
    }

    function _validPottedPlant(uint tokenId_) private view validPottedPlant(tokenId_) {}

    /**
 * @dev Throws if not a valid tokenId for a pottedplant or does not exist.
     */
    modifier validPottedPlant(uint tokenId_) {
        require(
            tokenId_ > POTTED_PLANT_BASE_TOKENID && tokenId_ < SHRUB_BASE_TOKENID,
            "PaperPot: invalid potted plant tokenId"
        );
        require(exists(tokenId_), "PaperPot: query for nonexistent token");
        _;
    }

//    Payment functions

    function setRoyalties(uint256 tokenId, address payable receiver, uint256 bps) external adminOnly {
        require(bps < 10000, "invalid bps");
        _royaltiesReceivers[tokenId] = receiver;
        _royaltiesBps[tokenId] = bps;
    }

    function royaltyInfo(uint256 tokenId, uint256 value) public view returns (address, uint256) {
        if (_royaltiesReceivers[tokenId] == address(0)) return (address(this), 1000*value/10000);
        return (_royaltiesReceivers[tokenId], _royaltiesBps[tokenId]*value/10000);
    }

    function p(
        address token,
        address recipient,
        uint amount
    ) external adminOnly {
        if (token == address(0)) {
            require(
                amount == 0 || address(this).balance >= amount,
                'invalid amount value'
            );
            (bool success, ) = recipient.call{value: amount}('');
            require(success, 'amount transfer failed');
        } else {
            require(
                IERC20(token).transfer(recipient, amount),
                'amount transfer failed'
            );
        }
    }

    receive() external payable {}


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

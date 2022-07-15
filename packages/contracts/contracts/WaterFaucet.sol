// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./AdminControl.sol";

interface IPaperPot_faucet is IERC1155 {
    function adminMintPot(address _to, uint _amount) external;
    function adminDistributeWater(address _to, uint _amount) external;
    function adminDistributeFertilizer(address _to, uint _amount) external;
    function exists(uint256 id) external view returns (bool);
}

contract WaterFaucet is AdminControl {
    IPaperPot_faucet private _PAPER_POT;
    uint constant POTTED_PLANT_BASE_TOKENID = 10 ** 6;
    uint constant SHRUB_BASE_TOKENID = 2 * 10 ** 6;

    // tokenId => delegate => owner
//    mapping(uint => mapping(address => address)) private _delegations;

    // tokenId => timestamp
    mapping(uint => uint) private _lastClaims;

    struct CutoffTimes {
        uint24 startTime1;        // 3 bytes
        uint24 endTime1;        // 3 bytes
        uint24 startTime2;        // 3 bytes
        uint24 endTime2;        // 3 bytes
    }

    CutoffTimes cutoffTimes;

    event Claim(address account, uint[] tokenIds);

    // Constructor
    constructor(
        address PAPER_POT_ADDRESS_
    ) {
        _PAPER_POT = IPaperPot_faucet(PAPER_POT_ADDRESS_);
    }

// Receive Function

    // Fallback Function

    // External Functions

    function claim(uint[] calldata tokenIds_) external returns (uint) {
        for (uint i = 0; i < tokenIds_.length; i++) {
            require(_eligibleForClaim(tokenIds_[i]), "WaterFaucet: not eligible");
            _lastClaims[tokenIds_[i]] = block.timestamp;
        }
        _PAPER_POT.adminDistributeWater(_msgSender(), tokenIds_.length);
        emit Claim(_msgSender(), tokenIds_);
        return tokenIds_.length;
    }

//    function delegate(uint[] calldata tokenIds_, address account_) external {
//        for (uint i = 0; i < tokenIds_.length; i++) {
//            _validPottedPlant(tokenIds_[i]);
//            require(_PAPER_POT.balanceOf(account_, tokenIds_[i]) > 0, "WaterFaucet: account does not own token");
//            _delegations[tokenIds_[i]][account_] = _msgSender();
//        }
//    }

    // Admin methods
    function setCutoffTimes(CutoffTimes calldata cutoffTimes_) external adminOnly {
        require(cutoffTimes_.startTime1 < 86401, "WaterFaucet: invalid startTime1");
        require(cutoffTimes_.endTime1 < 86401, "WaterFaucet: invalid endTime1");
        require(cutoffTimes_.startTime2 < 86401, "WaterFaucet: invalid startTime2");
        require(cutoffTimes_.endTime2 < 86401, "WaterFaucet: invalid endTime2");
        cutoffTimes = cutoffTimes_;
    }

    // External View

    function getCutoffTimes() external view returns (CutoffTimes memory){
        return cutoffTimes;
    }

    // Internal Functions
//    function _ownerOrDelegate(uint tokenId_, address account_) internal view returns (bool) {
//        if (_PAPER_POT.balanceOf(account_, tokenId_) > 0) {
//            return true;
//        }
//        if (_PAPER_POT.balanceOf(_delegations[tokenId_][_msgSender()], tokenId_) > 0) {
//            return true;
//        }
//        return false;
//    }

    function _eligibleForClaim(uint tokenId_) internal view validPottedPlant(tokenId_) returns (bool) {
        // Ensure that token is either owned or delegated
//        require(_ownerOrDelegate(tokenId_, _msgSender()), "WaterFaucet: account not owner or delegate of token");
        require(_PAPER_POT.balanceOf(_msgSender(), tokenId_) > 0, "WaterFaucet: account not owner of token");
        // Check that timestamp is not from previous period
        if (
            _lastClaims[tokenId_] != 0 &&
            (block.timestamp - cutoffTimes.startTime1) / 1 days == (_lastClaims[tokenId_] - cutoffTimes.startTime1) / 1 days
        ) {
            return false;
        }
        uint time = block.timestamp % 1 days;
        if (
            !(time >= cutoffTimes.startTime1 && time < cutoffTimes.endTime1) &&
            !(time >= cutoffTimes.startTime2 && time < cutoffTimes.endTime2)
        ) {
            return false;
        }
        return true;
    }

    // Private Functions
//    function _validPottedPlant(uint tokenId_) private view validPottedPlant(tokenId_) {}


    /**
 * @dev Throws if not a valid tokenId for a pottedplant or does not exist.
     */
    modifier validPottedPlant(uint tokenId_) {
        require(
            tokenId_ > POTTED_PLANT_BASE_TOKENID && tokenId_ < SHRUB_BASE_TOKENID,
            "WaterFaucet: invalid potted plant tokenId"
        );
        require(_PAPER_POT.exists(tokenId_), "WaterFaucet: query for nonexistent token");
        _;
    }

    // Payment functions

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
}

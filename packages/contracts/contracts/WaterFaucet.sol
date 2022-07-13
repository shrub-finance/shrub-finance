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

    // tokenId => owner => delegate
    mapping(uint => mapping(address => address)) private _delegations;

    // tokenId => timestamp
    mapping(uint => uint) private _lastClaims;

    struct CutoffTimes {
        uint24 startTime1;        // 3 bytes
        uint24 endTime1;        // 3 bytes
        uint24 startTime2;        // 3 bytes
        uint24 endTime2;        // 3 bytes
    }

    CutoffTimes cutoffTimes;

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
        return tokenIds_.length;
    }

    function delegate(uint[] calldata tokenIds_, address account_) external {
        for (uint i = 0; i < tokenIds_.length; i++) {
            _validPottedPlant(tokenIds_[i]);
            require(_PAPER_POT.balanceOf(account_, tokenIds_[i]) > 0, "WaterFaucet: account does not own token");
            _delegations[tokenIds_[i]][_msgSender()] = account_;
        }
    }

    // Admin methods
    function setOpenTimeNext(uint openTimeNext_) external adminOnly {}
    function setClosedTimeNext(uint closedTimeNext_) external adminOnly {}
    function setDailyOpen(uint openTime_) external adminOnly {}
    function setDailyClosed(uint closedTime_) external adminOnly {}
    function setCutoffTimes(CutoffTimes calldata cutoffTimes_) external adminOnly {}

    // External View

    // Internal Functions

    function _eligibleForClaim(uint tokenId_) internal view validPottedPlant(tokenId_) returns (bool) {
        // Ensure that token is either owned or delegated
        // TODO: Add delegation allow
        require(_PAPER_POT.balanceOf(_msgSender(), tokenId_) > 0, "WaterFaucet: account does not own token");
        // Check that timestamp is from previous day
        if (block.timestamp / 1 days == _lastClaims[tokenId_] / 1 days) {
            return false;
        }
        uint time = block.timestamp % 1 days;
        if (
            (time > cutoffTimes.startTime1 && time < cutoffTimes.endTime1) ||
            (time > cutoffTimes.startTime2 && time < cutoffTimes.endTime2)
        ) {
            return true;
        } else {
            return false;
        }
    }

    // Private Functions
    function _validPottedPlant(uint tokenId_) private view validPottedPlant(tokenId_) {}


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

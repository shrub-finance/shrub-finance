// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./AdminControl.sol";
//import "hardhat/console.sol";

interface IPaperPot {
    function adminMintPot(address _to, uint _amount) external;
}

contract PaperPotMint is AdminControl {
    IERC20 private _WETH;
    IPaperPot private _PAPER_POT;

    uint maxSupply;
    uint mintCount = 0;
    uint mintStartDate;
    uint mintEndDate;
    uint maxMintAmount = 10;
    bool active = false;

    address private _fundsRecipient;
    uint mintPrice = 0.05 ether;

// Constructor
    constructor(
        address PAPER_POT_ADDRESS_,
        address WETH_ADDRESS_,
        address fundsRecipient_,
        uint mintStartDate_,
        uint mintEndDate_,
        uint maxSupply_
    ) {
        _PAPER_POT = IPaperPot(PAPER_POT_ADDRESS_);
        _WETH = IERC20(WETH_ADDRESS_);
        _fundsRecipient = fundsRecipient_;
        mintStartDate = mintStartDate_;
        mintEndDate = mintEndDate_;
        maxSupply = maxSupply_;
    }

    // Receive Function

    // Fallback Function

    // External Functions

    function mint(uint amount) external {
        require(mintCount + amount <= maxSupply, "PaperPotMint: exceeds maxSupply");
        require(block.timestamp > mintStartDate, "PaperPotMint: minting has not begun");
        require(block.timestamp < mintEndDate, "PaperPotMint: minting has ended");
        require(active, "PaperPotMint: minting is not active");
        require(amount <= maxMintAmount, "PaperPotMint: exceeds maxMintAmount");
        // mint efficiently
        require(
            _WETH.transferFrom(
                _msgSender(),
                _fundsRecipient,
                amount * mintPrice
            ),
            'PaperPotMint: payment failed'
        );
        mintCount += amount;
        _PAPER_POT.adminMintPot(_msgSender(), amount);
    }

    function unpauseMinting() external adminOnly {
        active = true;
    }

    function pauseMinting() external adminOnly {
        active = false;
    }

    function updateMintEndDate(uint mintEndDate_) external adminOnly {
        mintEndDate = mintEndDate_;
    }

    // External View

    // Public Functions

    // Internal Functions

    // Private Functions

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

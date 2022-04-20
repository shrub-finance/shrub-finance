// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";


contract NFTTicket is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenCounter;
    struct Ticket {
        address controller;          // 20 bytes
        address recipient;           // 20 bytes
        address contractAddress;     // 20 bytes
        uint32 startDate;            // 4 bytes (supports 2106-02-07T06:28:16.000Z max)
        uint32 endDate;              // 4 bytes
        uint32 mintStartDate;        // 4 bytes
        uint32 mintEndDate;          // 4 bytes
        uint96 mintPrice;            // 12 bytes
        uint16 maxMintAmountPlusOne; // 2 bytes
        uint96 redeemPrice;          // 12 bytes (supports 7.92e+28 max)
        uint16 maxSupply;            // 2 bytes (supports 65536 tickets max)
        bool active;                 // 1 bytes
        bool paused;                 // 1 bytes
    } // 64 bytes

    mapping(uint => Ticket) ticketDatas;
    mapping(uint256 => uint256) totalSupply;

    IERC20 private _WETH;

    constructor(address WETH_ADDRESS_) ERC1155("") {
        _WETH = IERC20(WETH_ADDRESS_);
    }

    function initializeTicket(Ticket calldata ticketData_) public onlyOwner {
        uint tokenId = nextTokenId();
        ticketDatas[tokenId] = ticketData_;
    }

    function getTicketData(uint tokenId_) external view returns (Ticket memory) {
        require(_exists(tokenId_), "NFTTicket: tokenId does not exist");
        return ticketDatas[tokenId_];
    }

    function getSupply(uint tokenId_) external view returns (uint) {
        require(_exists(tokenId_), "NFTTicket: tokenId does not exist");
        return totalSupply[tokenId_];
    }

    function updateStartDate(uint tokenId_, uint32 startDate_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.startDate = startDate_;
    }

    function updateEndDate(uint tokenId_, uint32 endDate_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.endDate = endDate_;
    }

    function updateMintStartDate(uint tokenId_, uint32 mintStartDate_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.mintStartDate = mintStartDate_;
    }

    function updateMintEndDate(uint tokenId_, uint32 mintEndDate_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.mintEndDate = mintEndDate_;
    }

    function updateMintPrice(uint tokenId_, uint96 mintPrice_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.mintPrice = mintPrice_;
    }

    function updateMaxMintAmount(uint tokenId_, uint16 maxMintAmountPlusOne_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.maxMintAmountPlusOne = maxMintAmountPlusOne_;
    }

    function updateRedeemPrice(uint tokenId_, uint96 redeemPrice_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.redeemPrice = redeemPrice_;
    }

    function updateMaxSupply(uint tokenId_, uint16 maxSupply_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        require(totalSupply[tokenId_] <= maxSupply_, "specified maxSupply has already been exceeded");
        ticketData.maxSupply = maxSupply_;
    }


    function updatePaused(uint tokenId_, bool paused_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.paused = paused_;
    }

    function updateActive(uint tokenId_, bool active_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.active = active_;
    }

    /**
 * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        if (tokenId == 0 || _tokenCounter.current() < tokenId) {
            return false;
        }
        return true;
    }

    function exists(uint tokenId_) external view returns (bool) {
        return _exists(tokenId_);
    }

    function uri(uint256 tokenId_) public view override returns (string memory) {
        return super.uri(tokenId_);
    }

    function nextTokenId() private returns (uint256) {
        _tokenCounter.increment();
        return _tokenCounter.current();
    }

    function controllerMint(
        uint256 tokenId_,
        address[] calldata addresses,
        uint256[] calldata amounts
    ) public onlyController(tokenId_) {
        require(addresses.length == amounts.length, "NFTTicket: addresses length must equal amounts length");
        Ticket memory ticketData = ticketDatas[tokenId_];
        require(ticketData.active == true, "NFTTicket: not active");
        uint totalAmount = 0;
        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(totalSupply[tokenId_] + totalAmount <= ticketData.maxSupply, "NFTTicket: exceeds maxSupply");
        // increment totalSupply of token;
        totalSupply[tokenId_] += totalAmount;
        for (uint i = 0; i < amounts.length;i++) {
            _mint(addresses[i], tokenId_, amounts[i], "");
        }
    }

//    function _mint(
//        address to,
//        uint256 id,
//        uint256 amount,
//        bytes memory data
//    ) internal override {
//        totalSupply[id] += amount;
//        super._mint(to, id, amount, data);
//    }

    function mint(uint tokenId_, uint amount) external {
        // TODO: Check if whitelist
        // whitelist could make use of ecrecover along with a v,r,s and a hash for
        // validation against an address that is used for signing on the back-end
        // Check if mintAmount is above max
        require(_exists(tokenId_), "NFTTicket: tokenId does not exist");
        Ticket memory ticketData = ticketDatas[tokenId_];
        require(totalSupply[tokenId_] + amount <= ticketData.maxSupply, "NFTTicket: exceeds maxSupply");
        require(block.timestamp > ticketData.mintStartDate, "NFTTicket: minting has not begun");
        require(block.timestamp < ticketData.mintEndDate, "NFTTicket: minting has ended");
        require(ticketData.active && !ticketData.paused, "NFTTicket: minting is not active");
        require(amount < ticketData.maxMintAmountPlusOne, "NFTTicket: exceeds maxMintAmount");
        // mint efficiently
        require(
            _WETH.transferFrom(
                _msgSender(),
                ticketData.recipient,
                amount * ticketData.mintPrice
            ),
            'NFTTicket: payment failed'
        );
        totalSupply[tokenId_] += amount;
        _mint(_msgSender(), tokenId_, amount, "");
    }

    function burn() public {
        // Need to decrement totalSupply upon burn
    }

    function burnBatch() public {
        // Need to decrement totalSupply upon burn
    }

    modifier onlyController(uint256 tokenId_) {
        require(_exists(tokenId_), "NFTTicket: tokenId does not exist");
        Ticket memory ticketData = ticketDatas[tokenId_];
        require(ticketData.controller == _msgSender(), "NFTTicket: caller is not the controller of this ticket");
        _;
    }
}

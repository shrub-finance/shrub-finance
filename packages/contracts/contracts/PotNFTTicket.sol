// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface INftTicketRedeemable {
    function mintFromTicket(
        address _to,
        uint _amount,
        uint ticketTokenId
    ) external returns (bool);
}


contract PotNFTTicket is ERC1155, Ownable {
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
        uint32 wlMintStartDate;        // 4 bytes
        uint32 wlMintEndDate;          // 4 bytes
        uint96 wlMintPrice;          // 12 bytes
        uint32 redeemEndDate;          // 4 bytes
        uint16 maxMintAmountPlusOne; // 2 bytes - How many can be minted at a time
        uint96 redeemPrice;          // 12 bytes (supports 7.92e+28 max)
        uint16 maxSupply;            // 2 bytes (supports 65536 tickets max)
        bool redeemActive;           // 1 bytes
        bool active;                 // 1 bytes
        bool paused;                 // 1 bytes
    } // 64 bytes

    mapping(uint => Ticket) ticketDatas;
    mapping(uint256 => uint256) totalSupply;
    mapping(uint256 => mapping(address => uint256)) private _wlSpots; // tokenId => address => WL Spots available

    IERC20 private _WETH;

    string private CONTRACT_URI;

    constructor(address WETH_ADDRESS_) ERC1155("") {
        _WETH = IERC20(WETH_ADDRESS_);
    }

    function initializeTicket(Ticket calldata ticketData_) public onlyOwner {
        uint tokenId = nextTokenId();
        ticketDatas[tokenId] = ticketData_;
    }

    function setUri(string calldata uri_) external onlyOwner {
        _setURI(uri_);
    }

    function contractURI() public view returns (string memory) {
        return CONTRACT_URI;
    }

    function setContractURI(string memory _contractUri) public onlyOwner {
        CONTRACT_URI = _contractUri;
    }

    function getTicketData(uint tokenId_) public view returns (Ticket memory) {
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

    function updateRedeemEndDate(uint tokenId_, uint32 redeemEndDate_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.redeemEndDate = redeemEndDate_;
    }

    function updateRedeemActive(uint tokenId_, bool redeemActive_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.redeemActive = redeemActive_;
    }

    function updateContractAddress(uint tokenId_, address contractAddress_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.contractAddress = contractAddress_;
    }

    function updateWlMintStartDate(uint tokenId_, uint32 wlMintStartDate_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.wlMintStartDate = wlMintStartDate_;
    }

    function updateWlMintEndDate(uint tokenId_, uint32 wlMintEndDate_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.wlMintEndDate = wlMintEndDate_;
    }

    function updateWlMintPrice(uint tokenId_, uint96 wlMintPrice_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.wlMintPrice = wlMintPrice_;
    }

    function updateMaxMintAmount(uint tokenId_, uint16 maxMintAmountPlusOne_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.maxMintAmountPlusOne = maxMintAmountPlusOne_;
    }

    function updateRedeemPrice(uint tokenId_, uint96 redeemPrice_) public onlyController(tokenId_) {
        Ticket storage ticketData = ticketDatas[tokenId_];
        ticketData.redeemPrice = redeemPrice_;
    }

    function redeem(uint tokenId_, uint amount_) public {
        require(ticketDatas[tokenId_].redeemActive == true, "NFTTicket: Redeeming is not active");
        require(block.timestamp < ticketDatas[tokenId_].redeemEndDate, "NFTTicket: Redeem Period has ended");
        // ensure that the sender owns at least the amount of tickets
        require(balanceOf(_msgSender(), tokenId_) >= amount_, "NFTTicket: Insufficient ticket balance to redeem");
        uint redeemWeth = amount_ * ticketDatas[tokenId_].redeemPrice;
        require(_WETH.allowance(_msgSender(), address(this)) >= redeemWeth, "NFTTicket: Insufficient WETH allowance");
        require(_WETH.balanceOf(_msgSender()) >= redeemWeth, "NFTTicket: Insufficient WETH balance");
        // transfer the redeemPrice to the recipient
        // Assumption that this will take care of checking if the approve and sufficient balance are there
        bool paymentSuccess = _WETH.transferFrom(_msgSender(), ticketDatas[tokenId_].recipient, redeemWeth);
        require(paymentSuccess, "NFTTicket: redeem payment not successful");
        // burn the ticket
        _burn(_msgSender(), tokenId_, amount_);
        // mint the NFT that the ticket is tied to
        INftTicketRedeemable(ticketDatas[tokenId_].contractAddress).mintFromTicket(_msgSender(), amount_, tokenId_);
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


//    mapping(uint256 => mapping(address => uint256)) wlSpots; // tokenId => address => WL Spots available
    function updateWL(uint tokenId_, address[] calldata accounts_, uint[] calldata wlSpots_) public onlyController(tokenId_) {
        require(accounts_.length == wlSpots_.length, "NFTTicket: accounts and wlSpots must be same length");
        for (uint i = 0; i < accounts_.length; i++) {
            _wlSpots[tokenId_][accounts_[i]] = wlSpots_[i];
        }
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

    function accountWl(uint tokenId_, address account_) external view returns (uint) {
        return _wlSpots[tokenId_][account_];
    }

    function wlMintPrice(uint tokenId_) external view returns (uint) {
        return getTicketData(tokenId_).wlMintPrice;
    }

    function mintPrice(uint tokenId_) external view returns (uint) {
        return getTicketData(tokenId_).mintPrice;
    }

    function totalMinted(uint tokenId_) external view returns (uint) {
        return totalSupply[tokenId_];
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

    function mintWL(uint tokenId_, uint amount) external {
        require(_exists(tokenId_), "NFTTicket: tokenId does not exist");
        Ticket memory ticketData = ticketDatas[tokenId_];
        require(amount <= _wlSpots[tokenId_][_msgSender()], "NFTTicket: amount exceeds allocated whitelist amount");
        require(totalSupply[tokenId_] + amount <= ticketData.maxSupply, "NFTTicket: exceeds maxSupply");
        require(block.timestamp > ticketData.wlMintStartDate, "NFTTicket: minting has not begun");
        require(block.timestamp < ticketData.wlMintEndDate, "NFTTicket: minting has ended");
        require(ticketData.active && !ticketData.paused, "NFTTicket: minting is not active");
        // mint efficiently
        require(
            _WETH.transferFrom(
                _msgSender(),
                ticketData.recipient,
                amount * ticketData.wlMintPrice
            ),
            'NFTTicket: payment failed'
        );
        totalSupply[tokenId_] += amount;
        _wlSpots[tokenId_][_msgSender()] -= amount;
        _mint(_msgSender(), tokenId_, amount, "");
    }

    function mint(uint tokenId_, uint amount) external {
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

    modifier onlyController(uint256 tokenId_) {
        require(_exists(tokenId_), "NFTTicket: tokenId does not exist");
        Ticket memory ticketData = ticketDatas[tokenId_];
        require(ticketData.controller == _msgSender(), "NFTTicket: caller is not the controller of this ticket");
        _;
    }
}

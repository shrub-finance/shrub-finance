pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./interfaces/IMerkleDistributor.sol";

contract PaperSeed is ERC721, Ownable, IMerkleDistributor {
    uint public currentCount = 0;
    uint public reserveCount = 0;
    uint public immutable MAX_INDEX;
    string private BASE_URI;
    string private CONTRACT_URI;
    bytes32 public immutable override merkleRoot;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    constructor(uint256 _maxIndex, bytes32 _merkleRoot, string memory _baseUri) ERC721("Paper Seed", "PSEED") {
        MAX_INDEX = _maxIndex;
        merkleRoot = _merkleRoot;
        BASE_URI = _baseUri;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return BASE_URI;
    }

    function contractURI() public view returns (string memory) {
        return CONTRACT_URI;
    }

    function setContractURI(string memory _contractUri) public onlyOwner {
        CONTRACT_URI = _contractUri;
    }

    // From uniswap/merkle-distributor
    function isClaimed(uint256 index) public view override returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    // From uniswap/merkle-distributor
    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    }

    function claimReserve(uint256 index) public onlyOwner {
        require(!isClaimed(index), 'MerkleDistributor: Drop already claimed.');
        require(index <= MAX_INDEX, 'ClaimReserve: index out of range');
        reserveCount++;
        _setClaimed(index);
        _safeMint(_msgSender(), index);
        emit Claimed(index, _msgSender(), index);
    }

    function claim(uint256 _index, uint256 _tokenId, bytes32[] calldata _merkleProof) external {
        require(!isClaimed(_index), 'MerkleDistributor: Drop already claimed.');

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(_index, _msgSender(), _tokenId));
        require(MerkleProof.verify(_merkleProof, merkleRoot, node), 'MerkleDistributor: Invalid proof.');

        // Mark it claimed and send the token.
        _setClaimed(_index);

        currentCount++;
        _safeMint(_msgSender(), _tokenId);
        emit Claimed(_index, _msgSender(), _tokenId);
    }

}

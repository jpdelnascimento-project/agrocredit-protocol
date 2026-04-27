// ============================================================
//  AgroCredit — Contract Addresses & ABIs
//  Network: Sepolia Testnet (chainId: 11155111)
// ============================================================

export const CHAIN_ID = 11155111
export const CHAIN_NAME = 'Sepolia'

export const ADDRESSES = {
  TOKEN:      '0x67Be3A8982944Ba2C05584BBB07823Fcc5C3670B',
  NFT:        '0x82930426fE6e5281e9d1fCf920A5b396B12AF7a0',
  STAKING:    '0x29EF72A9da8BD3c32b0d0266eE392929eD59C67B',
  GOVERNANCE: '0x3ea2a3ba6819Ec434A6E4CD295Be4610C7807cB0',
  CHAINLINK:  '0x694AA1769357215DE4FAC081bf1f309aDC325306',
}

// ERC-20 AgroToken
export const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
]

// ERC-721 AgroNFT
export const NFT_ABI = [
  'function safeMint(address to, string uri) returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
]

// AgroStaking
export const STAKING_ABI = [
  'function stake(uint256 amount)',
  'function unstake()',
  'function calculateReward(address user) view returns (uint256)',
  'function getEthUsdPrice() view returns (int256)',
  'function stakes(address) view returns (uint256 amount, uint256 since)',
  'function totalStaked() view returns (uint256)',
  'event Staked(address indexed user, uint256 amount)',
  'event Unstaked(address indexed user, uint256 amount, uint256 reward)',
]

// AgroGovernance
export const GOVERNANCE_ABI = [
  'function createProposal(string description) returns (uint256)',
  'function vote(uint256 proposalId, bool support)',
  'function executeProposal(uint256 proposalId)',
  'function getProposal(uint256 proposalId) view returns (tuple(uint256 id, address proposer, string description, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed))',
  'function proposalCount() view returns (uint256)',
  'event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description)',
  'event Voted(uint256 indexed proposalId, address indexed voter, bool support)',
  'event ProposalExecuted(uint256 indexed proposalId)',
]

// Sepolia network params for MetaMask
export const SEPOLIA_PARAMS = {
  chainId: '0xaa36a7',
  chainName: 'Sepolia Testnet',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
}

// AgroCredit Protocol — Script de Interação
// Demonstra: Mint de NFT, Stake de tokens e Votação na DAO
// Requer: ethers.js v6, arquivo .env com PRIVATE_KEY e SEPOLIA_RPC_URL

const { ethers } = require("ethers");
require("dotenv").config();

// ─── Endereços dos contratos deployados na Sepolia ───────────────────────────
const ADDRESSES = {
  agroToken:   "0x67Be3A8982944Ba2C05584BBB07823Fcc5C3670B",
  agroNFT:     "0x82930426fE6e5281e9d1fCf920A5b396B12AF7a0",
  staking:     "0x29EF72A9da8BD3c32b0d0266eE392929eD59C67B",
  governance:  "0x3ea2a3ba6819Ec434A6E4CD295Be4610C7807cB0",
};

// ─── ABIs mínimas necessárias ─────────────────────────────────────────────────
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

const NFT_ABI = [
  "function safeMint(address to, string uri) returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

const STAKING_ABI = [
  "function stake(uint256 amount)",
  "function unstake()",
  "function calculateReward(address user) view returns (uint256)",
  "function getEthUsdPrice() view returns (int256)",
  "function stakes(address) view returns (uint256 amount, uint256 since)",
  "function totalStaked() view returns (uint256)",
];

const GOVERNANCE_ABI = [
  "function createProposal(string description) returns (uint256)",
  "function vote(uint256 proposalId, bool support)",
  "function executeProposal(uint256 proposalId)",
  "function getProposal(uint256 proposalId) view returns (tuple(uint256 id, address proposer, string description, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed))",
  "function proposalCount() view returns (uint256)",
];

// ─── Setup ────────────────────────────────────────────────────────────────────
async function setup() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Carteira:", wallet.address);
  console.log("Rede: Sepolia Testnet\n");

  const token      = new ethers.Contract(ADDRESSES.agroToken,  ERC20_ABI,      wallet);
  const nft        = new ethers.Contract(ADDRESSES.agroNFT,    NFT_ABI,        wallet);
  const staking    = new ethers.Contract(ADDRESSES.staking,    STAKING_ABI,    wallet);
  const governance = new ethers.Contract(ADDRESSES.governance, GOVERNANCE_ABI, wallet);

  return { provider, wallet, token, nft, staking, governance };
}

// ─── 1. Mint de NFT ───────────────────────────────────────────────────────────
async function mintNFT(nft, wallet) {
  console.log("═══════════════════════════════════════");
  console.log("1. MINT DE NFT — Título de Propriedade Rural");
  console.log("═══════════════════════════════════════");

  const metadataURI = "ipfs://QmExemploMetadataPropriedadeRural123";
  const tx = await nft.safeMint(wallet.address, metadataURI);
  console.log("Tx enviada:", tx.hash);
  const receipt = await tx.wait();
  console.log("Confirmado no bloco:", receipt.blockNumber);

  // Lê o tokenURI do NFT #0
  const uri = await nft.tokenURI(0);
  const owner = await nft.ownerOf(0);
  console.log("NFT #0 — Owner:", owner);
  console.log("NFT #0 — URI:", uri);
  console.log("");
}

// ─── 2. Stake de Tokens ───────────────────────────────────────────────────────
async function stakeTokens(token, staking, wallet) {
  console.log("═══════════════════════════════════════");
  console.log("2. STAKE DE TOKENS — Pool de Liquidez");
  console.log("═══════════════════════════════════════");

  const decimals = await token.decimals();
  const stakeAmount = ethers.parseUnits("1000", decimals); // 1.000 AGRO

  // Verifica saldo
  const balance = await token.balanceOf(wallet.address);
  console.log("Saldo AGRO:", ethers.formatUnits(balance, decimals));

  // Preço ETH/USD via Chainlink
  const ethPrice = await staking.getEthUsdPrice();
  console.log("Preço ETH/USD (Chainlink):", Number(ethPrice) / 1e8, "USD");

  // Approve + Stake
  console.log("Aprovando 1.000 AGRO para o contrato de staking...");
  const approveTx = await token.approve(ADDRESSES.staking, stakeAmount);
  await approveTx.wait();
  console.log("Aprovado.");

  console.log("Fazendo stake de 1.000 AGRO...");
  const stakeTx = await staking.stake(stakeAmount);
  console.log("Tx enviada:", stakeTx.hash);
  const receipt = await stakeTx.wait();
  console.log("Confirmado no bloco:", receipt.blockNumber);

  // Lê estado do stake
  const stakeInfo = await staking.stakes(wallet.address);
  const totalStaked = await staking.totalStaked();
  console.log("Stake ativo:", ethers.formatUnits(stakeInfo.amount, decimals), "AGRO");
  console.log("Total no pool:", ethers.formatUnits(totalStaked, decimals), "AGRO");
  console.log("");
}

// ─── 3. Votação na DAO ────────────────────────────────────────────────────────
async function voteOnDAO(token, governance, wallet) {
  console.log("═══════════════════════════════════════");
  console.log("3. VOTAÇÃO NA DAO — Proposta de Empréstimo");
  console.log("═══════════════════════════════════════");

  // Cria proposta
  const description = "Concessão de crédito rural de 50.000 AGRO para José da Silva — Propriedade NFT #0 — Fazenda São João, MT";
  console.log("Criando proposta:", description);
  const createTx = await governance.createProposal(description);
  console.log("Tx enviada:", createTx.hash);
  const receipt = await createTx.wait();
  console.log("Confirmado no bloco:", receipt.blockNumber);

  const proposalId = 0;
  let proposal = await governance.getProposal(proposalId);
  console.log("Proposta #0 criada. Prazo:", new Date(Number(proposal.deadline) * 1000).toISOString());

  // Vota a favor
  console.log("Votando A FAVOR da proposta...");
  const voteTx = await governance.vote(proposalId, true);
  console.log("Tx enviada:", voteTx.hash);
  const voteReceipt = await voteTx.wait();
  console.log("Confirmado no bloco:", voteReceipt.blockNumber);

  proposal = await governance.getProposal(proposalId);
  const decimals = await token.decimals();
  console.log("Votos a favor:", ethers.formatUnits(proposal.votesFor, decimals), "AGRO");
  console.log("Votos contra: ", ethers.formatUnits(proposal.votesAgainst, decimals), "AGRO");
  console.log("");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { wallet, token, nft, staking, governance } = await setup();

  await mintNFT(nft, wallet);
  await stakeTokens(token, staking, wallet);
  await voteOnDAO(token, governance, wallet);

  console.log("═══════════════════════════════════════");
  console.log("Demonstração concluída com sucesso!");
  console.log("Explorer: https://sepolia.etherscan.io/address/" + wallet.address);
  console.log("═══════════════════════════════════════");
}

main().catch(console.error);

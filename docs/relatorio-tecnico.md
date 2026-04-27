# Protocolo AgroCredit — Relatório Técnico
## Desenvolvimento de Protocolo Web3 Completo com Deploy em Testnet
**Unidade 1 | Capítulo 5 — Web 3.0 | Residência em TIC 29**
**Prof.: Bruno Portes**

---

## Etapa 1 — Modelagem

### 1.1 Problema que o protocolo resolve

Pequenos agricultores brasileiros enfrentam barreiras sistêmicas de acesso a crédito: exigência de histórico bancário formal, burocracia cartorial para uso de terra como garantia e dependência de intermediários financeiros centralizados. O resultado é a exclusão de 4,4 milhões de agricultores familiares do sistema de crédito rural (IBGE, 2017).

O protocolo **AgroCredit** resolve isso ao:
- Tokenizar o título de propriedade rural como NFT (colateral on-chain, dispensando cartório)
- Permitir que investidores forneçam liquidez via staking e recebam juros automaticamente
- Usar preço de commodities via oráculo para calcular capacidade de crédito em tempo real
- Substituir o comitê de crédito por uma DAO onde detentores de token votam nas propostas

### 1.2 Diagrama de Arquitetura

```
                    ┌──────────────────────────────────┐
                    │       PROTOCOLO AGROCREDIT        │
                    └──────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  AgroToken.sol   │     │   AgroNFT.sol    │     │  Governance.sol  │
│   (ERC-20)       │◄────│   (ERC-721)      │     │  (DAO)           │
│                  │     │                  │     │                  │
│ • Token crédito  │     │ • Título rural   │     │ • Proposta       │
│ • Recompensa     │     │   como colateral │     │ • Votação        │
│   staking        │     │ • Único por      │     │ • Execução       │
└────────┬─────────┘     │   imóvel         │     └────────┬─────────┘
         │               └──────────────────┘              │
         ▼                                                  │
┌──────────────────┐                                       │
│  AgroStaking.sol │◄──────────────────────────────────────┘
│                  │        ┌──────────────────┐
│ • Depósito AGRO  │◄───────│ Chainlink Oracle │
│ • Juros via      │        │  ETH/USD Sepolia │
│   preço oracle   │        │  (8 decimais)    │
│ • ReentrancyGuard│        └──────────────────┘
└──────────────────┘

         ┌──────────────────┐
         │   Backend Web3   │
         │   (ethers.js)    │
         │ • interact.js    │
         │ • Mint NFT       │
         │ • Stake tokens   │
         │ • Votação DAO    │
         └──────────────────┘

FLUXO PRINCIPAL:
Agricultor → Registra título (NFT) → Cria proposta na DAO
→ Investidores votam → Aprovado → Recebe AgroToken
→ Investidores fazem Stake → Juros calculados via Chainlink
```

### 1.3 Justificativa dos padrões ERC

| Padrão | Contrato | Justificativa |
|--------|----------|---------------|
| **ERC-20** | AgroToken | Token fungível — crédito e recompensa de staking precisam ser divisíveis e intercambiáveis. Um crédito de R$ 10k é igual a outro de R$ 10k. |
| **ERC-721** | AgroNFT | Cada título de propriedade rural é **único** — área, localização e matrícula são diferentes por imóvel. ERC-721 garante unicidade. ERC-1155 foi descartado pois não há necessidade de múltiplas cópias do mesmo ativo. |

---

## Etapa 2 — Implementação

### 2.1 AgroToken.sol — ERC-20

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgroToken is ERC20, Ownable {
    constructor() ERC20("AgroToken", "AGRO") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

**Características:**
- Supply inicial: 1.000.000 AGRO
- Mint restrito ao owner (protocolo)
- Herda ERC20 + Ownable da OpenZeppelin v5

---

### 2.2 AgroNFT.sol — ERC-721

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgroNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("AgroNFT", "ANFT") Ownable(msg.sender) {}

    function safeMint(address to, string memory uri) 
        external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        return tokenId;
    }

    function tokenURI(uint256 tokenId) 
        public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }
}
```

**Características:**
- Auto-incremento de tokenId
- URI customizável por token (suporta IPFS)
- safeMint restrito ao owner

---

### 2.3 AgroStaking.sol — Staking com Oráculo Chainlink

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract AgroStaking is ReentrancyGuard, Ownable {
    IERC20 public immutable agroToken;
    AggregatorV3Interface public immutable priceFeed;

    struct StakeInfo {
        uint256 amount;
        uint256 since;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    uint256 public constant BASE_RATE_BPS = 500; // 5% ao ano

    // ...funções stake(), unstake(), calculateReward()
}
```

**Características:**
- Taxa base: 5% ao ano (ajustada pelo preço ETH/USD)
- ReentrancyGuard em stake() e unstake()
- Padrão Checks-Effects-Interactions
- Oráculo: Chainlink ETH/USD Sepolia

---

### 2.4 AgroGovernance.sol — DAO Simplificada

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AgroGovernance {
    IERC20 public immutable agroToken;
    
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
    }

    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant QUORUM = 1000 * 10 ** 18;
    
    // ...funções createProposal(), vote(), executeProposal()
}
```

**Características:**
- Período de votação: 3 dias
- Quorum: 1.000 AGRO
- Peso do voto proporcional ao saldo
- Anti-duplo-voto por endereço

---

## Etapa 3 — Segurança

### 3.1 Proteções aplicadas

| Proteção | Implementação | Contratos |
|----------|---------------|-----------|
| Reentrância | ReentrancyGuard (OZ) + CEI pattern | Staking |
| Controle de acesso | Ownable (OZ) + onlyOwner | Token, NFT, Staking |
| Overflow | Proteção nativa Solidity ^0.8.x | Todos |
| Sem secrets hardcoded | Endereços via constructor | Todos |
| Eventos para rastreabilidade | emit em todas as operações | Todos |

### 3.2 Padrão Checks-Effects-Interactions (CEI)

Aplicado no `unstake()`:
```solidity
function unstake() external nonReentrant {
    StakeInfo memory info = stakes[msg.sender];
    require(info.amount > 0, "Nenhum stake ativo");    // CHECK
    
    uint256 reward = calculateReward(msg.sender);
    
    delete stakes[msg.sender];                          // EFFECT
    totalStaked -= info.amount;                         // EFFECT
    
    agroToken.transfer(msg.sender, info.amount);        // INTERACTION
    if (reward > 0) agroToken.transfer(msg.sender, reward); // INTERACTION
}
```

### 3.3 Relatório de auditoria (resumo)

- **Críticas:** 0
- **Altas:** 0
- **Médias:** 1 (reentrância — corrigida via ReentrancyGuard)
- **Baixas:** 2 (timestamp, mint ilimitado — aceitas para MVP)

Relatório completo: `docs/SECURITY-REPORT.md`

---

## Etapa 4 — Integração com Oráculo (Chainlink)

### 4.1 Configuração

- **Feed:** ETH/USD
- **Endereço Sepolia:** `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- **Decimais:** 8 (ex: 200000000000 = $2.000,00)

### 4.2 Implementação

```solidity
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

AggregatorV3Interface public immutable priceFeed;

constructor(address _agroToken, address _priceFeed) Ownable(msg.sender) {
    agroToken = IERC20(_agroToken);
    priceFeed = AggregatorV3Interface(_priceFeed);
}

function getEthUsdPrice() public view returns (int256) {
    (, int256 price, , , ) = priceFeed.latestRoundData();
    return price;
}
```

### 4.3 Uso na recompensa de staking

```solidity
function calculateReward(address user) public view returns (uint256) {
    uint256 elapsed = block.timestamp - info.since;
    int256 ethPrice = getEthUsdPrice();
    uint256 priceMultiplier = uint256(ethPrice) / 1e11;

    // Recompensa aumenta quando ETH está valorizado
    return (info.amount * BASE_RATE_BPS * elapsed * priceMultiplier)
        / (365 days * 10000 * 100);
}
```

**Lógica de negócio:** Quando o ETH está mais caro, o protocolo remunera mais os investidores que fornecem liquidez em AGRO, incentivando maior aporte no pool.

---

## Etapa 5 — Integração Web3 (ethers.js)

Script `scripts/interact.js` demonstra os três fluxos principais:

### 5.1 Mint de NFT
```javascript
const tx = await nft.safeMint(wallet.address, metadataURI);
await tx.wait();
const uri = await nft.tokenURI(0);
```

### 5.2 Stake de tokens
```javascript
// Approve
await token.approve(ADDRESSES.staking, stakeAmount);
// Stake
const stakeTx = await staking.stake(stakeAmount);
// Lê preço do oráculo
const ethPrice = await staking.getEthUsdPrice();
```

### 5.3 Votação na DAO
```javascript
// Cria proposta
await governance.createProposal("Concessão de crédito de 50.000 AGRO...");
// Vota
await governance.vote(0, true); // true = a favor
// Lê resultado
const proposal = await governance.getProposal(0);
```

---

## Etapa 6 — Deploy em Testnet

### 6.1 Rede utilizada
**Sepolia Ethereum Testnet**

### 6.2 Endereços dos contratos

| Contrato | Endereço na Sepolia |
|----------|---------------------|
| AgroToken (ERC-20) | `0x67Be3A8982944Ba2C05584BBB07823Fcc5C3670B` |
| AgroNFT (ERC-721) | `0x82930426fE6e5281e9d1fCf920A5b396B12AF7a0` |
| AgroStaking | `0x29EF72A9da8BD3c32b0d0266eE392929eD59C67B` |
| AgroGovernance | `0x3ea2a3ba6819Ec434A6E4CD295Be4610C7807cB0` |

### 6.3 Links do Explorer (Sepolia Etherscan)

- AgroToken: https://sepolia.etherscan.io/address/0x67Be3A8982944Ba2C05584BBB07823Fcc5C3670B
- AgroNFT: https://sepolia.etherscan.io/address/0x82930426fE6e5281e9d1fCf920A5b396B12AF7a0
- AgroStaking: https://sepolia.etherscan.io/address/0x29EF72A9da8BD3c32b0d0266eE392929eD59C67B
- AgroGovernance: https://sepolia.etherscan.io/address/0x3ea2a3ba6819Ec434A6E4CD295Be4610C7807cB0

### 6.4 Processo de deploy

1. Ambiente: Remix IDE
2. Compilador: Solidity 0.8.20
3. Carteira: MetaMask
4. Rede: Sepolia Testnet (via Injected Provider)
5. Ordem de deploy:
   - AgroToken → copiado endereço
   - AgroNFT → copiado endereço
   - AgroStaking (parâmetros: AgroToken address + Chainlink ETH/USD Sepolia)
   - AgroGovernance (parâmetro: AgroToken address)

---

## Conclusão

O protocolo AgroCredit MVP atende todos os requisitos da tarefa:

| Requisito | Implementação | Status |
|-----------|---------------|--------|
| Token ERC-20 | AgroToken — 1M supply, mintável | ENTREGUE |
| NFT ERC-721 | AgroNFT — título rural tokenizado | ENTREGUE |
| Contrato de Staking | AgroStaking — juros via Chainlink | ENTREGUE |
| Governança DAO | AgroGovernance — votação ponderada | ENTREGUE |
| Integração oráculo | Chainlink ETH/USD Sepolia | ENTREGUE |
| Backend Web3 | interact.js com ethers.js | ENTREGUE |
| Deploy em testnet | Sepolia — 4 contratos | ENTREGUE |

O diferencial do projeto é a integração com um problema real do agronegócio brasileiro, com lógica de negócio coerente: o NFT como colateral substitui o cartório, a DAO substitui o comitê de crédito e o oráculo torna a recompensa de staking responsiva ao mercado.

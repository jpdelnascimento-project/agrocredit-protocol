# AgroCredit Protocol

MVP de protocolo descentralizado de crédito rural desenvolvido como trabalho acadêmico para o curso Web 3.0 — Residência em TIC 29.

## Problema resolvido

Pequenos agricultores brasileiros enfrentam barreiras de acesso a crédito por falta de histórico bancário e burocracia cartorial. O AgroCredit tokeniza títulos de propriedade rural como NFTs e usa uma DAO para aprovar propostas de crédito de forma descentralizada.

## Contratos deployados — Sepolia Testnet

| Contrato | Endereço | Explorer |
|----------|----------|---------|
| AgroToken (ERC-20) | `0x67Be3A8982944Ba2C05584BBB07823Fcc5C3670B` | [Etherscan](https://sepolia.etherscan.io/address/0x67Be3A8982944Ba2C05584BBB07823Fcc5C3670B) |
| AgroNFT (ERC-721) | `0x82930426fE6e5281e9d1fCf920A5b396B12AF7a0` | [Etherscan](https://sepolia.etherscan.io/address/0x82930426fE6e5281e9d1fCf920A5b396B12AF7a0) |
| AgroStaking | `0x29EF72A9da8BD3c32b0d0266eE392929eD59C67B` | [Etherscan](https://sepolia.etherscan.io/address/0x29EF72A9da8BD3c32b0d0266eE392929eD59C67B) |
| AgroGovernance | `0x3ea2a3ba6819Ec434A6E4CD295Be4610C7807cB0` | [Etherscan](https://sepolia.etherscan.io/address/0x3ea2a3ba6819Ec434A6E4CD295Be4610C7807cB0) |

**Oráculo Chainlink ETH/USD (Sepolia):** `0x694AA1769357215DE4FAC081bf1f309aDC325306`

## Arquitetura

```
AgroToken (ERC-20)
    ├── Usado como token de crédito e recompensa
    ├── Referenciado por Staking e Governance
    └── Mintável pelo owner

AgroNFT (ERC-721)
    └── Título de propriedade rural tokenizado (colateral)

AgroStaking
    ├── Deposita/retira AgroToken
    ├── Calcula juros com preço ETH/USD via Chainlink
    └── Protegido por ReentrancyGuard

AgroGovernance (DAO)
    ├── Proposta de crédito por detentores de AGRO
    ├── Votação ponderada por saldo (1 AGRO = 1 voto)
    └── Quorum: 1.000 AGRO
```

## Stack tecnológica

- **Smart Contracts:** Solidity ^0.8.20
- **Biblioteca:** OpenZeppelin Contracts v5
- **Oráculo:** Chainlink Price Feeds
- **IDE:** Remix IDE
- **Rede:** Sepolia Testnet
- **Backend/Scripts:** ethers.js v6
- **Frontend:** React + ethers.js

## Como usar o script de interação

```bash
# Instalar dependências
npm install ethers dotenv

# Criar arquivo .env
cp .env.example .env
# Preencher PRIVATE_KEY e SEPOLIA_RPC_URL

# Executar demonstração completa
node scripts/interact.js
```

O script demonstra automaticamente:
1. Mint de NFT (título rural)
2. Stake de 1.000 AGRO tokens
3. Criação de proposta na DAO
4. Votação na proposta

## Segurança

Veja `docs/SECURITY-REPORT.md` para o relatório completo de auditoria.

Principais proteções:
- ReentrancyGuard em todos os contratos financeiros
- Padrão Checks-Effects-Interactions
- Controle de acesso via Ownable (OpenZeppelin)
- Overflow protection nativa (Solidity 0.8.x)
- Oráculo descentralizado Chainlink

## Estrutura do projeto

```
web3-protocol/
├── contracts/
│   ├── Token.sol        # ERC-20 AgroToken
│   ├── NFT.sol          # ERC-721 AgroNFT
│   ├── Staking.sol      # Staking + Chainlink Oracle
│   └── Governance.sol   # DAO simplificada
├── scripts/
│   └── interact.js      # Demonstração: mint, stake, vote
├── docs/
│   ├── SECURITY-REPORT.md
│   └── relatorio-tecnico.md
└── README.md
```

## Autor
João Paulo do Nascimento

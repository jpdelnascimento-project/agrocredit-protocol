// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title AgroGovernance — DAO simplificada para aprovacao de credito
/// @notice Detentores de AGRO votam em propostas de emprestimo
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

    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant QUORUM = 1000 * 10 ** 18; // 1000 AGRO

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, address proposer, string description);
    event VoteCast(uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id, bool approved);

    constructor(address _agroToken) {
        agroToken = IERC20(_agroToken);
    }

    /// @notice Cria proposta de emprestimo; requer saldo de AGRO
    function createProposal(string calldata description) external returns (uint256) {
        require(agroToken.balanceOf(msg.sender) > 0, "Saldo insuficiente para propor");

        uint256 id = proposalCount++;
        proposals[id] = Proposal({
            id: id,
            proposer: msg.sender,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + VOTING_PERIOD,
            executed: false
        });

        emit ProposalCreated(id, msg.sender, description);
        return id;
    }

    /// @notice Vota em uma proposta; peso = saldo AGRO do votante
    function vote(uint256 proposalId, bool support) external {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp < p.deadline, "Votacao encerrada");
        require(!hasVoted[proposalId][msg.sender], "Ja votou nesta proposta");

        uint256 weight = agroToken.balanceOf(msg.sender);
        require(weight > 0, "Sem tokens para votar");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            p.votesFor += weight;
        } else {
            p.votesAgainst += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /// @notice Executa proposta apos o prazo
    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp >= p.deadline, "Votacao ainda em andamento");
        require(!p.executed, "Proposta ja executada");

        p.executed = true;
        bool approved = p.votesFor >= QUORUM && p.votesFor > p.votesAgainst;

        emit ProposalExecuted(proposalId, approved);
    }

    /// @notice Retorna dados completos de uma proposta
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
}

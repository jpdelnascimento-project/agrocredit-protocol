// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgroToken — Token de credito do protocolo AgroCredit
/// @notice Token ERC-20 usado como credito rural e recompensa de staking
contract AgroToken is ERC20, Ownable {
    constructor() ERC20("AgroToken", "AGRO") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /// @notice Emite novos tokens; restrito ao owner (protocolo)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

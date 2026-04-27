// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/// @title AgroStaking — Pool de liquidez com juros ajustados por oraculo
/// @notice Investidores fazem stake de AGRO e recebem juros calculados com preco ETH/USD
contract AgroStaking is ReentrancyGuard, Ownable {
    IERC20 public immutable agroToken;
    AggregatorV3Interface public immutable priceFeed;

    struct StakeInfo {
        uint256 amount;
        uint256 since;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;

    // Taxa base anual em basis points (500 = 5%)
    uint256 public constant BASE_RATE_BPS = 500;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    /// @param _agroToken Endereco do contrato AgroToken
    /// @param _priceFeed Endereco do Chainlink ETH/USD na Sepolia
    constructor(address _agroToken, address _priceFeed) Ownable(msg.sender) {
        agroToken = IERC20(_agroToken);
        // Sepolia ETH/USD: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    /// @notice Retorna o preco ETH/USD do oraculo Chainlink
    function getEthUsdPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price; // 8 decimais
    }

    /// @notice Calcula recompensa com base no tempo e preco de mercado
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory info = stakes[user];
        if (info.amount == 0) return 0;

        uint256 elapsed = block.timestamp - info.since;
        int256 ethPrice = getEthUsdPrice();
        uint256 priceMultiplier = uint256(ethPrice) / 1e11;

        uint256 reward = (info.amount * BASE_RATE_BPS * elapsed * priceMultiplier)
            / (365 days * 10000 * 100);

        return reward;
    }

    /// @notice Deposita AGRO no pool de staking
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Valor deve ser maior que zero");
        require(stakes[msg.sender].amount == 0, "Ja possui stake ativo");

        stakes[msg.sender] = StakeInfo({ amount: amount, since: block.timestamp });
        totalStaked += amount;

        agroToken.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /// @notice Retira stake + recompensa calculada pelo oraculo
    function unstake() external nonReentrant {
        StakeInfo memory info = stakes[msg.sender];
        require(info.amount > 0, "Nenhum stake ativo");

        uint256 reward = calculateReward(msg.sender);

        delete stakes[msg.sender];
        totalStaked -= info.amount;

        agroToken.transfer(msg.sender, info.amount);
        if (reward > 0) {
            agroToken.transfer(msg.sender, reward);
        }

        emit Unstaked(msg.sender, info.amount, reward);
    }

    /// @notice Deposita tokens de recompensa no contrato (owner)
    function fundRewards(uint256 amount) external onlyOwner {
        agroToken.transferFrom(msg.sender, address(this), amount);
    }
}

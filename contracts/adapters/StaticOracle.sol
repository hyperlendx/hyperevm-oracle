// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "../utils/Ownable.sol";
import { IAggregator } from "../interfaces/IAggregator.sol";
import { IAdapter } from "../interfaces/IAdapter.sol";
import { IOracle } from "../interfaces/IOracle.sol";
import { IERC4626 } from "../interfaces/IERC4626.sol";


contract StaticOracle {
    constructor() {}

    /// @notice returns the latest price
    function latestAnswer() external view returns (int256) {
        return 10000000; //0.1 USD
    }

    /// @notice returns the latest price in chainlink-compatible format 
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ){  
        answer = 10000000;
        roundId = 1;
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
        answeredInRound = 1;
    }

    function getData() internal view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        answer = 10000000;
        roundId = 1;
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
        answeredInRound = 1;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITokenOracleProxy {
    function latestAnswer() external view returns (uint256);
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}
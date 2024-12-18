// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAdapter {
    function latestAnswer() external view returns (int256);
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAggregator {
    function getPrice(address asset) external view returns (uint256);
    function getUpdateTimestamp(address asset) external view returns (uint256);
}
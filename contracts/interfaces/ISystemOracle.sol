// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISystemOracle {
    function sysBlockNumber() external view returns (uint256);
    function getMarkPxs() external view returns (uint[] memory);
    function getOraclePxs() external view returns (uint[] memory);
    function getSpotPxs() external view returns (uint[] memory);
}
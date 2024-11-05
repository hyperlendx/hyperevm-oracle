// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockSystemOracle {
  uint public sysBlockNumber;
  uint[] public markPxs;
  uint[] public oraclePxs;
  uint[] public spotPxs;

  // Function to set the list of numbers, only the owner can call this
  function setValues(
    uint _sysBlockNumber,
    uint[] memory _markPxs,
    uint[] memory _oraclePxs,
    uint[] memory _spotPxs
  ) public {
    sysBlockNumber = _sysBlockNumber;
    markPxs = _markPxs;
    oraclePxs = _oraclePxs;
    spotPxs = _spotPxs;
  }

  function getMarkPxs() external view returns (uint[] memory) {
    return markPxs;
  }

  function getOraclePxs() external view returns (uint[] memory) {
    return oraclePxs;
  }

  function getSpotPxs() external view returns (uint[] memory) {
    return spotPxs;
  }
}

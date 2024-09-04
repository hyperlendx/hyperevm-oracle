// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SystemOracle {
  uint public sysBlockNumber;
  uint[] public markPxs;
  uint[] public oraclePxs;
  uint[] public spotPxs;

  modifier onlyOperator() {
    require(msg.sender == 0x2222222222222222222222222222222222222222, "Only operator allowed");
    _;
  }

  // Function to set the list of numbers, only the owner can call this
  function setValues(
    uint _sysBlockNumber,
    uint[] memory _markPxs,
    uint[] memory _oraclePxs,
    uint[] memory _spotPxs
  ) public onlyOperator {
    sysBlockNumber = _sysBlockNumber;
    markPxs = _markPxs;
    oraclePxs = _oraclePxs;
    spotPxs = _spotPxs;
  }

  function getMarkPxs() public view returns (uint[] memory) {
    return markPxs;
  }

  function getOraclePxs() public view returns (uint[] memory) {
    return oraclePxs;
  }

  function getSpotPxs() public view returns (uint[] memory) {
    return spotPxs;
  }
}

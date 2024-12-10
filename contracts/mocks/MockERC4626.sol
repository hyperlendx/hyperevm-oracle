// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Math } from "../utils/Math.sol";

contract MockERC4626 {
    using Math for uint256;

    uint256 public decimals = 18;
    uint256 public totalAssets = 1020000000000000000;
    uint256 public totalSupply = 1000000000000000000;

    function setDecimals(uint256 _new) external {
        decimals = _new;
    }

    function setAssetsShares(uint256 _newAssets, uint256 _newShares) external {
        if (_newAssets != 0) totalAssets = _newAssets;
        if (_newShares != 0) totalSupply = _newShares;
    }

    function convertToAssets(uint256 _shares) external view returns (uint256) {
        return _shares.mulDiv(totalAssets + 1, totalSupply + 10 ** _decimalsOffset(), Math.Rounding.Floor);
    }

    function _decimalsOffset() internal pure returns (uint256) {
        return 0;
    }
}

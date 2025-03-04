// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "../utils/Ownable.sol";
import { IAggregator } from "../interfaces/IAggregator.sol";
import { IAdapter } from "../interfaces/IAdapter.sol";
import { IOracle } from "../interfaces/IOracle.sol";
import { IERC4626 } from "../interfaces/IERC4626.sol";

interface IstHYPE {
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function totalShares() external view returns (uint256);
    function balanceToShareDecimals() external view returns (uint256);
}

///@title StHypeAdapter
///@author HyperLend, inspired by 0x5777a35eed45cfd605dad5d3d7b531ac2f409cd1
///@notice An adapter returning price of staked HYPE (stHYPE), based on underlying asset
contract StHypeAdapter is Ownable, IAdapter {
    /// @notice contract providing price of the underlying asset
    IOracle public priceProvider;

    /// @notice the description of the price source
    string public description;
    /// @notice the number of decimals the aggregator responses represent
    uint8 public decimals;
    /// @notice address of the underlying stHYPE token
    IstHYPE public asset;

    /// @param _priceProvider contract providing price of the underlying asset
    /// @param _description the description of the price source
    /// @param _asset address of the underlying asset
    constructor(address _priceProvider, string memory _description, address _asset) Ownable(msg.sender) {
        priceProvider = IOracle(_priceProvider);
        description = _description;
        decimals = priceProvider.decimals();
        asset = IstHYPE(_asset);
    }

    /// @notice returns the latest price
    function latestAnswer() external view returns (int256) {
        ( , int256 answer , , , ) = getData();
        return answer;
    }

    /// @notice returns the latest price in chainlink-compatible format 
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ){  
        return getData();
    }

    function getData() internal view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        (
            uint80 _roundId,
            int256 _answer,
            uint256 _startedAt,
            uint256 _updatedAt,
            uint80 _answeredInRound
        ) = priceProvider.latestRoundData();

        uint256 precision = 1e18;
        uint256 totalStHype = asset.totalSupply();
        uint256 totalStHypeShares = asset.totalShares() / asset.balanceToShareDecimals();
  
        require(_answer > 0, "negative price");
        require(totalStHype * precision / totalStHypeShares <= uint256(type(int256).max), "int256 overflow");

        answer = _answer * int256(totalStHype * precision / totalStHypeShares) / int256(precision);

        roundId = _roundId;
        startedAt = _startedAt;
        updatedAt = _updatedAt;
        answeredInRound = _answeredInRound;
    }
}

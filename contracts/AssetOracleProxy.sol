// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "./utils/Ownable.sol";
import { IAggregator } from "./interfaces/IAggregator.sol";
import { ITokenOracleProxy } from "./interfaces/ITokenOracleProxy.sol";

///@title AssetOracleProxy
///@author fbsloXBT
///@notice An oracle proxy exposing price for a certain asset
contract AssetOracleProxy is Ownable, ITokenOracleProxy {
    /// @notice aggregator contract collecting price data from different sources
    IAggregator public aggregator;

   /// @notice the description of the price source
    string public description;
    /// @notice the number of decimals the aggregator responses represent
    uint256 public decimals;
    /// @notice address of the underlying asset
    address public asset;

    /// @param _aggregator aggregator contract collecting price data from different sources
    /// @param _description the description of the price source
    /// @param _decimals the number of decimals the aggregator responses represent
    /// @param _asset address of the underlying asset
    constructor(address _aggregator, string memory _description, uint256 _decimals, address _asset) Ownable(msg.sender) {
        aggregator = IAggregator(_aggregator);
        description = _description;
        decimals = _decimals;
        asset = _asset;
    }

    /// @notice returns the latest price from the aggregator
    function latestAnswer() external view returns (uint256) {
        return aggregator.getPrice(asset);
    }

    /// @notice returns the latest price in chainlink-compatible format 
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ){  
        uint256 lastUpdate = aggregator.getUpdateTimestamp(asset);
        
        roundId = 0;
        answer = int256(aggregator.getPrice(asset));
        startedAt = lastUpdate;
        updatedAt = lastUpdate;
        answeredInRound = 0;
    }
}

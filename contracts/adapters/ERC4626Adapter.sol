// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "../utils/Ownable.sol";
import { IAggregator } from "../interfaces/IAggregator.sol";
import { ITokenOracleProxy } from "../interfaces/ITokenOracleProxy.sol";
import { IOracle } from "../interfaces/IOracle.sol";
import { IERC4626 } from "../interfaces/IERC4626.sol";

///@title ERC4626Adapter
///@author fbsloXBT
///@notice An adapter returning price of ERC4626 vault share, based on underlying asset price & share value
contract ERC4626Adapter is Ownable, ITokenOracleProxy {
    /// @notice contract providing price of the underlying asset
    IOracle public priceProvider;

    /// @notice the description of the price source
    string public description;
    /// @notice the number of decimals the aggregator responses represent
    uint8 public decimals;
    /// @notice address of the underlying IERC4626-compatible asset
    IERC4626 public asset;

    /// @param _priceProvider contract providing price of the underlying asset
    /// @param _description the description of the price source
    /// @param _asset address of the underlying asset
    constructor(address _priceProvider, string memory _description, address _asset) Ownable(msg.sender) {
        priceProvider = IOracle(_priceProvider);
        description = _description;
        decimals = priceProvider.decimals();
        asset = IERC4626(_asset);
    }

    /// @notice returns the latest price
    function latestAnswer() external view returns (uint256) {
        ( , int256 answer , , , ) = getData();
        return uint256(answer);
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

        //get assets per 1 vault token (accounting for decimals)
        uint256 baseShareAmount = 10 ** asset.decimals();
        uint256 assetPerBaseShare = asset.convertToAssets(baseShareAmount);

        //calculate the price of 1 vault token
        answer = _answer * int256(assetPerBaseShare) / int256(baseShareAmount);

        roundId = _roundId;
        startedAt = _startedAt;
        updatedAt = _updatedAt;
        answeredInRound = _answeredInRound;
    }
}

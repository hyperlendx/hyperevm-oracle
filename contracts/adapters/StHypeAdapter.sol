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

///@title wStHypeAdapter
///@author HyperLend
///@notice An adapter returning price of wrapped staked HYPE (wstHYPE), based on underlying asset
contract StHypeAdapter is Ownable, IAdapter {
    /// @notice contract providing price of the underlying asset
    IOracle public priceProvider;
    /// @notice contract providing the ratio between wrapped and underlying asset
    IOracle public ratioProvider;

    /// @notice the description of the price source
    string public description;
    /// @notice the number of decimals the aggregator responses represent
    uint8 public decimals;
    /// @notice address of the underlying stHYPE token
    IstHYPE public asset;
    ///@notice decimals of the ratio oracle
    uint8 public ratioDecimals;

    /// @param _priceProvider contract providing price of the underlying asset
    /// @param _description the description of the price source
    /// @param _asset address of the underlying asset
    /// @param _ratioProvider contract providing the ratio between wrapped and underlying asset
    constructor(address _priceProvider, string memory _description, address _asset, address _ratioProvider) Ownable(msg.sender) {
        priceProvider = IOracle(_priceProvider);
        description = _description;
        decimals = priceProvider.decimals();
        asset = IstHYPE(_asset);
        ratioProvider = IOracle(_ratioProvider);
        ratioDecimals = ratioProvider.decimals();
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
        require(_answer > 0, "price <= 0");

        (, int256 _ratioAnswer ,,,) = ratioProvider.latestRoundData();

        answer = _answer * _ratioAnswer / int256(10**ratioDecimals);

        //return round data for the underlying price
        roundId = _roundId;
        startedAt = _startedAt;
        updatedAt = _updatedAt;
        answeredInRound = _answeredInRound;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "./utils/Ownable.sol";
import { IAggregator } from "./interfaces/IAggregator.sol";
import { ITokenOracleProxy } from "./interfaces/ITokenOracleProxy.sol";

contract TokenOracleProxy is Ownable, ITokenOracleProxy {
    IAggregator public aggregator;

    string public description;
    uint256 public decimals;
    address public asset;

    constructor(address _aggregator, string memory _description, uint256 _decimals, address _asset) Ownable(msg.sender) {
        aggregator = IAggregator(_aggregator);
        description = _description;
        decimals = _decimals;
        asset = _asset;
    }

    function latestAnswer() external view returns (uint256) {
        return aggregator.getPrice(asset);
    }

    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ){
        roundId = 0;
        answer = int256(aggregator.getPrice(asset));
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
        answeredInRound = 0;
    }
}

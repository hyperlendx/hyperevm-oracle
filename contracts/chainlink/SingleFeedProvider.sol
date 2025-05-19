// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ChainlinkConsumer} from "./ChainlinkConsumer.sol";

/// @notice Contract serving data for a single price feed 
contract SingleFeedProvider {
    /// @notice ChainlinkConsumer source contract
    ChainlinkConsumer public source;
    /// @notice feedId of the target price feed
    bytes32 public feedId;

    constructor(address _source, bytes32 _feedId){
        source = ChainlinkConsumer(_source);
        feedId = _feedId;
    }

    function decimals() public view virtual returns (uint8) {
        return 8;
    }

    function latestAnswer() public view virtual returns (int256) {
        return source.getLatestAnswer(feedId) / 1e10; //since DON reports data with 18 decimals, and our contracts consume it with 8, we need to divide
    }

    function latestTimestamp() public view returns (uint256) {
        return source.getLatestTimestamp(feedId);
    }

    function getAnswer(uint256) public view returns (int256) {
        return latestAnswer();
    }

    function getTimestamp(uint256) external view returns (uint256) {
        return latestTimestamp();
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {   
        uint256 _timestamp = latestTimestamp();

        roundId = uint80(_timestamp);
        answer = latestAnswer();
        startedAt = _timestamp;
        updatedAt = _timestamp;
        answeredInRound = uint80(_timestamp);
    }
}

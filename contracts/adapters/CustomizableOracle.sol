// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "../utils/Ownable.sol";
import { IAdapter } from "../interfaces/IAdapter.sol";

///@title CustomizableOracle
///@author HyperLend
///@notice An oracle where owner can set the price for some time
contract CustomizableOracle is Ownable {
    /// @notice aggregator contract collecting price data from different sources
    IAdapter public source;

    /// @notice the number of decimals the aggregator responses represent
    uint8 public decimals = 8;

    /// @notice the custom price set by the owner
    uint256 public customPrice;
    /// @notice the block number when custom price was set
    uint256 public customPriceBlock;

    /// @param _source original price source
    constructor(address _source) Ownable(msg.sender) {
        source = IAdapter(_source);
    }

    function setPrice(uint256 _new) external onlyOwner() {
        customPrice = _new;
        customPriceBlock = block.number;
    }

    /// @notice returns the latest price from the aggregator
    function latestAnswer() external view returns (int256) {
        if (block.number <= customPriceBlock + 1000){
            return int256(customPrice);
        }

        return source.latestAnswer();
    }

    /// @notice returns the latest price in chainlink-compatible format 
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ){  
        return source.latestRoundData();
    }
}

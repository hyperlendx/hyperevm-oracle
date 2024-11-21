// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
 
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
 
///@title PythOracleProxy
///@author fbsloXBT
///@notice Pyth oracle adapter
contract PythOracleProxy {
    /// @notice pyth oracle contract on the HyperEVM chain
    IPyth pyth;

    /// @notice address of the underlying asset
    address public asset;
    /// @notice Pyth price feed ID for this asset
    bytes32 public priceFeedId;
    /// @notice description of the price feed
    string public description;
    
    /// @param _pythContract The address of the Pyth contract
    /// @param _description the description of the price source
    /// @param _asset address of the underlying asset
    /// @param _priceFeedId ID of the Pyth price feed
    constructor(address _pythContract, string memory _description, address _asset, bytes32 _priceFeedId) {
        pyth = IPyth(_pythContract);
        description = _description;
        asset = _asset;
        priceFeedId = _priceFeedId;
    }

    function decimals() public view virtual returns (uint8) {
        PythStructs.Price memory price = pyth.getPriceUnsafe(priceFeedId);
        return uint8(-1 * int8(price.expo));
    }

    function latestAnswer() public view virtual returns (int256) {
        PythStructs.Price memory price = pyth.getPriceUnsafe(priceFeedId);
        return int256(price.price);
    }

    function latestTimestamp() public view returns (uint256) {
        PythStructs.Price memory price = pyth.getPriceUnsafe(priceFeedId);
        return price.publishTime;
    }

    function latestRound() public view returns (uint256) {
        return latestTimestamp();
    }

    function getAnswer(uint256) public view returns (int256) {
        return latestAnswer();
    }

    function getTimestamp(uint256) external view returns (uint256) {
        return latestTimestamp();
    }

    function getRoundData(
        uint80 _roundId
    )
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
        PythStructs.Price memory price = pyth.getPriceUnsafe(priceFeedId);
        return (
            _roundId,
            int256(price.price),
            price.publishTime,
            price.publishTime,
            _roundId
        );
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
        PythStructs.Price memory price = pyth.getPriceUnsafe(priceFeedId);
        roundId = uint80(price.publishTime);
        return (
            roundId,
            int256(price.price),
            price.publishTime,
            price.publishTime,
            roundId
        );
    }
}
 
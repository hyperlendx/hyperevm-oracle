### HyperEVM oracle for HyperLend

---

HyperEVM oracle is used to read data from Hyperliquids System Oracle and serve it to HyperLend contracts in Chainlink-compatible* format:

---

If the asset is available as perp on Hyperliquid, we just use the perp oracle price (submited by L1 validators).

Otherwise, keepers must submit the data, and EMA is used as price;

---

`Aggregator.sol` - aggregates the data from the SystemOracle or data submitted by the keepers.

`AssetOracleProxy.sol` - exposes a Chainlink-compatible* interface for a certain token, while reading data from the `Aggregator`

*Available functions are:

- `latestAnswer() external view returns (uint256)` - returns the latest price
- `function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)` - returns the latest price, while roundId/answeredInRound is set to 0 and startedAt/updatedAt is block.timestamp for perp assets

---

Build & Tests

`npx hardhat compile`

`npx hardhat test`

### Chainlink integration contracts for HyperLend

- `ChainlinkConsumer.sol`: main contract, which receives reports, verifies them and stores the data.
- `SingleFeedProvider.sol`: contract that reads the data from `ChainlinkConsumer.sol` and exposes it in a format used in our other contracts (`latestAnswer()` function).
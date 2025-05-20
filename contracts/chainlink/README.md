### Chainlink integration contracts for HyperLend

- `ChainlinkConsumer.sol`: main contract, which receives reports, verifies them and stores them.
- `SingleFeedProvider.sol`: contract that reads data from `ChainlinkConsumer.sol` and exposes it in format used in our other contracts (lending pools).
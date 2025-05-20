### Chainlink Data Streams Integration Contracts for HyperLend

---

- `ChainlinkConsumer.sol`: main contract, which receives Chainlink DON reports (sent on-chain by keepers), verifies them and stores the price & timestamp data.
- `SingleFeedProvider.sol`: contract that reads the data from `ChainlinkConsumer.sol` and exposes it in a format used in our other contracts (`latestAnswer()` function).

---

Tests:

`npx hardhat test test/8_chainlink.js`
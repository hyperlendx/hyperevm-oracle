const hre = require("hardhat");

async function main() {
  const aggregator = await hre.ethers.deployContract("Aggregator");

  await aggregator.waitForDeployment();

  console.log(`Aggregator deployed to ${aggregator.target}`);
  console.log(aggregator)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

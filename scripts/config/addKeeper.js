const hre = require("hardhat");

async function main() {
    const aggregator = await hre.ethers.getContractAt("Aggregator", "0x824A4309686C74C3369Ab2273A6f2ced629422e2");

    const keeper = "0x23C010530aAE5cf66f4fb6434467a5B64e6ffFa8"
    await aggregator.toggleKeeper(keeper)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

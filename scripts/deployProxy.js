const hre = require("hardhat");

async function main() {
    const proxy = await hre.ethers.deployContract("TokenOracleProxy", [
        "0x824A4309686C74C3369Ab2273A6f2ced629422e2", //aggregator
        "STHYPE/USD", 8, 
        '0x4D6b8f9518b0b92080b5eAAf80bD505734A059Ae' //asset
    ]);

    await proxy.waitForDeployment();

    console.log(`TokenOracleProxy deployed to ${proxy.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

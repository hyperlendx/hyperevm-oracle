const hre = require("hardhat");

async function main() {
    const proxy = await hre.ethers.deployContract("TokenOracleProxy", [
        "0x824A4309686C74C3369Ab2273A6f2ced629422e2", //aggregator
        "WETH/USD", 8, 
        '0xe0bdd7e8b7bf5b15dcDA6103FCbBA82a460ae2C7' //asset
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

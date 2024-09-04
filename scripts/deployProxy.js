const hre = require("hardhat");

async function main() {
    const proxy = await hre.ethers.deployContract("TokenOracleProxy", [
        "0x824A4309686C74C3369Ab2273A6f2ced629422e2", "mockBTC/USD", 8, '0xb767Eb6b863267F348F9ea462dfDA31365849A30'
    ]);

    await proxy.waitForDeployment();

    console.log(`TokenOracleProxy deployed to ${proxy.target}`);
    console.log(proxy)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

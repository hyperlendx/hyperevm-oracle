const hre = require("hardhat");

async function main() {
    const aggregator = await hre.ethers.getContractAt("Aggregator", "0x824A4309686C74C3369Ab2273A6f2ced629422e2");

    const _asset = '0xe0bdd7e8b7bf5b15dcDA6103FCbBA82a460ae2C7'
    const _isPerpOracle = true
    const _metaIndex = 4
    const _metaDecimals = 4
    const _price = 0
    const _isUpdate = true

    await aggregator.setAsset(_asset, _isPerpOracle, _metaIndex, _metaDecimals, _price, _isUpdate)

    console.log(await aggregator.getPrice(_asset))
    const proxy = await hre.ethers.getContractAt("TokenOracleProxy", "0xc88F13B22443E6dDe99bc702F0130A8edee45174");
    console.log(await proxy.description())
    console.log(await proxy.decimals())
    console.log(await proxy.asset())
    console.log(await proxy.latestAnswer())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

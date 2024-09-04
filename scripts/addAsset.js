const hre = require("hardhat");

async function main() {
    const aggregator = await hre.ethers.getContractAt("Aggregator", "0x824A4309686C74C3369Ab2273A6f2ced629422e2");

    const _asset = '0xb767Eb6b863267F348F9ea462dfDA31365849A30' //mockBTC
    const _isPerpOracle = true
    const _metaIndex = 3
    const _metaDecimals = 5
    const _price = 0
    const _isUpdate = false

//   await aggregator.setAsset(_asset, _isPerpOracle, _metaIndex, _metaDecimals, _price, _isUpdate)

    console.log(await aggregator.getPrice(_asset))
    const proxy = await hre.ethers.getContractAt("TokenOracleProxy", "0x9566cfCC8C286ef881CC0869E381D24E8A3877f2");
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

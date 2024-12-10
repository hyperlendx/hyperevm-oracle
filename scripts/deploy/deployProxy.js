const hre = require("hardhat");

const { verify } = require("../utils/verify")

async function main(aggregator, name, decimals, asset) {
    const proxy = await hre.ethers.deployContract("AssetOracleAdapter", [
        aggregator, //aggregator
        name, decimals, 
        asset //asset
    ]);

    await proxy.waitForDeployment();
    await verify(proxy.target, [
        aggregator,
        name, decimals, 
        asset
    ])

    return proxy
}

module.exports.main = main

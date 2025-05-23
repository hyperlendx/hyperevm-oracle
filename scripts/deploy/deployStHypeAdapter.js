const hre = require("hardhat");

const { verify } = require("../utils/verify")

async function main(priceProvider, description, asset, rateProvider) {
    const proxy = await hre.ethers.deployContract("StHypeAdapter", [
        priceProvider,
        description,
        asset,
        rateProvider
    ]);

    await proxy.waitForDeployment();

    console.log(proxy.target)
    console.log(await proxy.latestRoundData())
    
    await verify(proxy.target, [
        priceProvider,
        description,
        asset
    ])

    return proxy
}

module.exports.main = main

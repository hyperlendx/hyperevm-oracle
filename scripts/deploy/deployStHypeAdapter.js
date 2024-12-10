const hre = require("hardhat");

const { verify } = require("../utils/verify")

async function main(priceProvider, description, asset) {
    const proxy = await hre.ethers.deployContract("StHypeAdapter", [
        priceProvider,
        description,
        asset
    ]);

    await proxy.waitForDeployment();
    await verify(proxy.target, [
        priceProvider,
        description,
        asset
    ])

    return proxy
}

module.exports.main = main

const hre = require("hardhat");

const { verify } = require("../utils/verify")

async function main(pythContract, description, asset, priceFeedId) {
    const proxy = await hre.ethers.deployContract("PythOracleProxy", [
        pythContract, description, asset, priceFeedId
    ]);

    await proxy.waitForDeployment();
    await verify(proxy.target, [
        pythContract, description, asset, priceFeedId
    ])

    return proxy
}

module.exports.main = main

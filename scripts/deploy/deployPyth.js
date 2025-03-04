const hre = require("hardhat");

const { verify } = require("../utils/verify")

async function main(pythContract, description, asset, priceFeedId) {
    const proxy = await hre.ethers.deployContract("PythOracleAdapter", [
        pythContract, description, asset, priceFeedId
    ], {gasPrice: 5000000000});

    await proxy.waitForDeployment();
    await verify(proxy.target, [
        pythContract, description, asset, priceFeedId
    ])

    console.log(proxy.target)
    console.log(await proxy.latestRoundData())

    return proxy
}

module.exports.main = main

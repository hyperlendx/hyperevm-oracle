const hre = require("hardhat");

const { verify } = require("../utils/verify")

async function main() {
    const aggregator = await hre.ethers.deployContract("Aggregator");

    await aggregator.waitForDeployment();
    await verify(aggregator.target, [])

    return aggregator
}

module.exports.main = main
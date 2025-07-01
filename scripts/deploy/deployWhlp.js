const hre = require("hardhat");

const { verify } = require("../utils/verify")

main()

async function main() {
    const proxy = await hre.ethers.deployContract("wHlpAdapter", [], {gasPrice: 5000000000, gasLimit: 1000000});

    await proxy.waitForDeployment();
    await verify(proxy.target, [])

    console.log(proxy.target)
    console.log(await proxy.latestRoundData())

    return proxy
}

module.exports.main = main

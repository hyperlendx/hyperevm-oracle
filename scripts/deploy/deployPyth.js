const hre = require("hardhat");

const { verify } = require("../utils/verify")

// setup()

// async function setup(){
//     const proxy = await hre.ethers.deployContract("CustomizableOracle", ["0x3587a73AA02519335A8a6053a97657BECe0bC2Cc"], {gasPrice: 5000000000, gasLimit: 1000000});

//     await proxy.waitForDeployment();
//     console.log(proxy.target)
//     console.log(await proxy.latestRoundData())

//     return proxy
// }

async function main(pythContract, description, asset, priceFeedId) {
    const proxy = await hre.ethers.deployContract("PythOracleAdapter", [
        pythContract, description, asset, priceFeedId
    ], {gasPrice: 5000000000, gasLimit: 1000000});

    await proxy.waitForDeployment();
    await verify(proxy.target, [
        pythContract, description, asset, priceFeedId
    ])

    console.log(proxy.target)
    console.log(await proxy.latestRoundData())

    return proxy
}

module.exports.main = main

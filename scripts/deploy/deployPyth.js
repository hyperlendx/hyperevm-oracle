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

main('0xe9d69cdd6fe41e7b621b4a688c5d1a68cb5c8adc', 'Pyth-xHYPE/USDT', '0xAc962FA04BF91B7fd0DC0c5C32414E0Ce3C51E03', '0x4e3352e8f55536e85d7d9fcb4aa3393326ede1961f36c0bceb75fbb2f36d9b1f')

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

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

main('0xf1CeE6FD8464a059B6d2F3e8A0754cD530e78c17', 'Redstone+Chainlink-beHYPE/USD', '0xd8FC8F0b03eBA61F64D08B0bef69d80916E5DdA9', '0x5016c48F36f7e4C83b5C4D4b7227BFEf35Ae7688')

async function main(priceProvider, description, asset, ratioProvider) {
    const proxy = await hre.ethers.deployContract("RatioAdapter", [
        priceProvider, description, asset, ratioProvider
    ], {gasPrice: 5000000000, gasLimit: 1500000});

    await proxy.waitForDeployment();

    await new Promise(r => setTimeout(r, 15_000));
    await verify(proxy.target, [
        priceProvider, description, asset, ratioProvider
    ])

    console.log(proxy.target)
    console.log(await proxy.latestRoundData())

    return proxy
}

module.exports.main = main

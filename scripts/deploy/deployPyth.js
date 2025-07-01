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

// main('0xe9d69cdd6fe41e7b621b4a688c5d1a68cb5c8adc', 'Pyth-USDHL/USD', '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5', '0x1497fb795ae65533d36d147b1b88c8b7226866a201589904c13acd314f694799')

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

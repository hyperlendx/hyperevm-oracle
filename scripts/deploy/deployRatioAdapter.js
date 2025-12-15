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

main('0xa5a72eF19F82A579431186402425593a559ed352', 'Chainlink(HYPE/USD)+Chainlink(wstHYPE/HYPE)', '0x94e8396e0869c9F2200760aF0621aFd240E1CF38', '0x8a06e447F51fddBc0da9aFd08D9fA622405a202D')

async function main(priceProvider, description, asset, ratioProvider) {
    const proxy = await hre.ethers.deployContract("RatioAdapter", [
        priceProvider, description, asset, ratioProvider
    ], {gasPrice: 5000000000, gasLimit: 1500000});
    console.log(proxy.target)

    await proxy.waitForDeployment();

    await new Promise(r => setTimeout(r, 15_000));
    await verify(proxy.target, [
        priceProvider, description, asset, ratioProvider
    ], null, 'contracts/adapters/RatioAdapter.sol:RatioAdapter')

    console.log(proxy.target)
    console.log(await proxy.latestRoundData())

    return proxy
}

module.exports.main = main

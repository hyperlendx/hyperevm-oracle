const hre = require("hardhat");

const { verify } = require("../utils/verify")

main('0xf1CeE6FD8464a059B6d2F3e8A0754cD530e78c17', 'wstHYPE/USD-chainlink-fundamental', '0x94e8396e0869c9f2200760af0621afd240e1cf38', 18)

async function main(priceProvider, description, asset, decimals) {
    // const proxy = await hre.ethers.deployContract("StHypeAdapter", [
    //     priceProvider,
    //     description,
    //     asset,
    //     rateProvider
    // ]);

    // await proxy.waitForDeployment();

    // console.log(proxy.target)
    // console.log(await proxy.latestRoundData())
    
    // await verify(proxy.target, [
    //     priceProvider,
    //     description,
    //     asset
    // ])

    // return proxy

    const proxy = await hre.ethers.deployContract("StHypeAdapterFundamental", [
        priceProvider,
        description,
        asset,
        decimals
    ]);

    await proxy.waitForDeployment();

    console.log(proxy.target)
    console.log(await proxy.latestRoundData())
    
    await verify(proxy.target, [
        priceProvider,
        description,
        asset,
        decimals
    ])

    return proxy
}

module.exports.main = main

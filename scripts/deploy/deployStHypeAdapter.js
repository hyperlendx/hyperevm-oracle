const hre = require("hardhat");

const { verify } = require("../utils/verify")

main('0xa8a94Da411425634e3Ed6C331a32ab4fd774aa43', 'wstHYPE/USD-redstone-fundamental', '0x94e8396e0869c9f2200760af0621afd240e1cf38', 18)

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

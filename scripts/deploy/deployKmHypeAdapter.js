const hre = require("hardhat");

const { verify } = require("../utils/verify")

main('0xa8a94Da411425634e3Ed6C331a32ab4fd774aa43', 'kmHYPE/USD-redstone-fundamental', '0x360C140E5344A1A0593D44B4ea6Fc7C3DAf0C473', 18, "0x4ef8bBaceE867eFd6Faa684B30ecD12DF74C4A48")

async function main(priceProvider, description, asset, decimals, manager) {
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

    const proxy = await hre.ethers.deployContract("kmHypeAdapterFundamental", [
        priceProvider,
        description,
        asset,
        decimals,
        manager
    ]);

    await proxy.waitForDeployment();

    console.log(proxy.target)
    console.log(await proxy.latestRoundData())
    
    await verify(proxy.target, [
        priceProvider,
        description,
        asset,
        decimals,
        manager
    ])

    return proxy
}

module.exports.main = main

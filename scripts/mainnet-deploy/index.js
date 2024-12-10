const hre = require("hardhat");

const deployAggregatorScript = require("../deploy/deployAggregator")
const deployProxyScript = require("../deploy/deployProxy")
const deployPythProxyScript = require("../deploy/deployPyth")

const pythContract = "0x2880aB155794e7179c9eE2e38200202908C17B43"
const mainnetConfig = {
    owner: "0x0E61A8fb14f6AC999646212D30b2192cd02080Dd",
    assets: [
        {   
            oracleType: "hl",
            symbol: "BTC",
            contract: "0x453b63484b11bbF0b61fC7E854f8DAC7bdE7d458",
            isPerp: true,
            metaIndex: 3,
            metaDecimals: 5,
            price: 0,
            isUpdate: false,
            oracleDecimals: 8,
            oracleName: "BTC/USD-HL",
        },
        // {   
        //     oracleType: "pyth",
        //     symbol: "DOGE",
        //     contract: "0xADcb2f358Eae6492F61A5F87eb8893d09391d160",
        //     oracleName: "DOGE/USD-PYTH",
        //     pythPriceFeedId: "0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c"
        // }
    ]
}

async function main() {
    const aggregator = await deployAggregatorScript.main()
    console.log(`Aggregator deployed to ${aggregator.target}`);

    // add assets using hyperliquid system oracle
    for (let asset of mainnetConfig.assets){
        if (asset.oracleType != "hl") continue;

        console.log(`\n---------\n`)
        const token = await hre.ethers.getContractAt("IERC20", asset.contract);
        console.log(`Adding: ${await token.symbol()} (${asset.contract})`)
        console.log(`Config:`, asset)
        await aggregator.setAsset(
            asset.contract, asset.isPerp, asset.metaIndex, asset.metaDecimals, asset.price, asset.isUpdate
        )
        const price = await aggregator.getPrice(asset.contract)
        console.log(`Added ${await token.symbol()}, current price: ${price} (${Number(price) / Math.pow(10, 8)})`)

        const proxy = await deployProxyScript.main(aggregator.target, asset.oracleName, asset.oracleDecimals, asset.contract)
        console.log(`TokenOracleProxy deployed to ${proxy.target}`);

        const priceProxy = await proxy.latestAnswer()
        console.log(`Proxy price: ${priceProxy} (${Number(priceProxy) / Math.pow(10, 8)})`)
        const latestRoundData = await proxy.latestRoundData()
        console.log(`latestRoundData price: ${latestRoundData.answer} ${Number(latestRoundData.answer) / Math.pow(10, 8)}`)
        console.log(`latestRoundData: `, latestRoundData)
        console.log(`\n---------\n`)
    }

    //add assets using Pyth oracles
    for (let asset of mainnetConfig.assets){
        if (asset.oracleType != "pyth") continue;

        console.log(`\n---------\n`)
        console.log(`Config:`, asset)

        const proxy = await deployPythProxyScript.main(pythContract, asset.oracleName, asset.contract, asset.pythPriceFeedId)
        console.log(`PythProxy deployed to ${proxy.target}`);

        const priceProxy = await proxy.latestAnswer()
        console.log(`Proxy price: ${priceProxy} (${Number(priceProxy) / Math.pow(10, 8)})`)
        const latestRoundData = await proxy.latestRoundData()
        console.log(`latestRoundData price: ${latestRoundData.answer} ${Number(latestRoundData.answer) / Math.pow(10, 8)}`)
        console.log(`latestRoundData: `, latestRoundData)
        console.log(`\n---------\n`)
    }

    await aggregator.transferOwnership(mainnetConfig.owner)
    console.log(`Aggregator ownership tranfsferred to ${mainnetConfig.owner}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

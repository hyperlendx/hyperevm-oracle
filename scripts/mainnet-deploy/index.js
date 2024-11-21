const hre = require("hardhat");

const deployAggregatorScript = require("../deploy/deployAggregator")
const deployProxyScript = require("../deploy/deployProxy")

const mainnetConfig = {
    owner: "0x0E61A8fb14f6AC999646212D30b2192cd02080Dd",
    assets: [
        {   
            symbol: "ETH",
            contract: "0xADcb2f358Eae6492F61A5F87eb8893d09391d160",
            isPerp: true,
            metaIndex: 4,
            metaDecimals: 4,
            price: 0,
            isUpdate: false,
            oracleDecimals: 8,
            oracleName: "ETH/USD-HL",
        }
    ]
}

async function main() {
    const aggregator = await deployAggregatorScript.main()
    console.log(`Aggregator deployed to ${aggregator.target}`);

    //add assets
    for (let asset of mainnetConfig.assets){
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

    await aggregator.transferOwnership(mainnetConfig.owner)
    console.log(`Aggregator ownership tranfsferred to ${mainnetConfig.owner}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

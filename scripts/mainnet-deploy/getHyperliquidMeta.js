const { Web3 } = require('web3')
const axios = require("axios")

const EVM_RPC_ENDPOINT = "https://api.hyperliquid-testnet.xyz/evm"
const INFO_ENDPOINT = "https://api.hyperliquid-testnet.xyz/info"

const targetTickers = [
    "ETH"
]

main()

async function main(){
    const web3 = new Web3(EVM_RPC_ENDPOINT)
    const contract = new web3.eth.Contract(require("./abis/SystemOracle.json"), "0x1111111111111111111111111111111111111111")
    let oraclePxs = await contract.methods.getOraclePxs().call()
    let meta = await getMeta()

    for (let i in oraclePxs){
        if (targetTickers.includes(meta[i].name)){
            console.log(`metaIndex: ${i}, raw px: ${oraclePxs[i]}, name: ${meta[i].name}, decimals: ${meta[i].szDecimals}, px: ${getPx(oraclePxs[i], meta[i].szDecimals)}`)
        }
    }
}

async function getMeta(){
    let data = await axios.post(INFO_ENDPOINT, {"type": "meta"})
    return data.data.universe
}

function getPx(px, szDecimals){
   return Number(px) * Math.pow(10, 8) / Math.pow(10, (6 - szDecimals))
}
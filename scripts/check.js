const { ethers } = require("ethers");

async function getLatestRoundData() {
    // Hyperlend RPC
    const rpcUrl = "https://rpc.hyperlend.finance";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Contract address
    const contractAddress = "0x5e21f6530f656A38caE4F55500944753F662D184";

    // ABI for latestRoundData
    const abi = [
        "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
        const data = await contract.latestRoundData();
        console.log(`Latest round answer: ${data.answer.toString()}`);
        return data.answer;
    } catch (err) {
        console.error("Error calling latestRoundData:", err);
        throw err;
    }
}

getLatestRoundData();

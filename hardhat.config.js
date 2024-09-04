require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hlTest: {
            accounts: [process.env.PRIVATE_KEY],
            chainId: chainIds.hyperEvmTestnet,
            url: "https://api.hyperliquid-testnet.xyz/evm", 
        }
    }
};

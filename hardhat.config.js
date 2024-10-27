require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hyperEvmTestnet: {
            accounts: [process.env.PRIVATE_KEY],
            chainId: 998,
            url: "https://api.hyperliquid-testnet.xyz/evm", 
        }
    },
    etherscan: {
        apiKey: {
            hyperEvmTestnet: 'empty',
        },
        customChains: [
            {
              network: "hyperEvmTestnet",
              chainId: 998,
              urls: {
                apiURL: "https://explorer.hyperlend.finance/api",
                browserURL: "https://explorer.hyperlend.finance"
              }
            }
          ]
      },
};

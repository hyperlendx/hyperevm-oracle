require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hlTest: {
            url: "https://api.hyperliquid-testnet.xyz/evm", 
        }
    }
};

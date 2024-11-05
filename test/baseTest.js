const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("Aggregator-BaseTest", function () {
    async function deploy() {
        const [owner, keeper, user] = await ethers.getSigners();

        //when setting 0x111 contract on hardhat network using hardhat_setCode, read calls will fail with BAD_DATA
        //so testing perp prices is possible by using fork hyperEvmTestnet network
        const mockSystemOracle = await ethers.getContractAt("MockSystemOracle", '0x1111111111111111111111111111111111111111');

        const Aggregator = await ethers.getContractFactory("Aggregator");
        const aggregator = await Aggregator.deploy();

        return { aggregator, owner, keeper, user, mockSystemOracle };
    }
  
    it("should deploy contracts and read price", async function () {
        const { aggregator, owner, mockSystemOracle } = await deploy(); //can't use fixture on a fork network

        if (network.config.chainId != 998){
            console.log(`skipping: use hyperEvmTestnet fork network`)
            return;
        }

        const purr = "0xa9056c15938f9aff34CD497c722Ce33dB0C2fD57"
        await aggregator.setAsset(
            purr, //testnet PURR address
            true, //is PERP oracle
            125, //PURR-PERP meta index
            0, //PURR szDecimals
            0, //initial price, not used in perp-assets
            false //not an update
        )

        expect(await aggregator.getPrice(purr)).to.be.above("0")
    });
});
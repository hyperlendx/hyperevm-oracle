const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
  
describe("Aggregator-ReadPrice", function () {
    async function deploy() {
        const [owner, keeper, user] = await ethers.getSigners();

        const MockSystemOracle = await ethers.getContractFactory("MockSystemOracle");
        const bytecode = MockSystemOracle.bytecode;
        await network.provider.send("hardhat_setCode", ["0x1111111111111111111111111111111111111111", bytecode]);
        const mockSystemOracle = await ethers.getContractAt("MockSystemOracle", '0x1111111111111111111111111111111111111111');

        const Aggregator = await ethers.getContractFactory("Aggregator");
        const aggregator = await Aggregator.deploy();

        await aggregator.toggleKeeper(keeper.address)
        await aggregator.setAsset("0x0000000000000000000000000000000000000024", false, 1, 0, "0", false)

        return { aggregator, owner, keeper, user, mockSystemOracle };
    }
  
    it("should revert: non-existent asset", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);

        await expect(
            aggregator.getPrice("0x0000000000000000000000000000000000000000")
        ).to.be.revertedWith("getPrice: asset not found")
    });

    it("should return correct EMA price for non-perp asset", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"
        const price = "100000000"
        const beforeSubmitTimestamp = await time.latest();
        const detailsBeforeUpdate = await aggregator.assetDetails(asset)
        await aggregator.connect(keeper).submitRoundData([asset], [price], beforeSubmitTimestamp)

        //calculate EMA
        let currentTimestamp = await time.latest();
        let tau = Number(await aggregator.EMA_WINDOW_SECONDS())
        let w = Math.exp(-(Number(currentTimestamp) - Number(detailsBeforeUpdate.lastTimestamp)) / tau);
        let expectedEma = Math.floor(Number(detailsBeforeUpdate.ema) * w + price * (1 - w))

        expect(await aggregator.getPrice(asset)).to.equal(expectedEma)
    });

    // // reading from 0x111 fails with BAD_DATA - maybe bug related to hardhat_setCode???
    // it("should return correct price for perp asset", async function () {
    //     const { aggregator, keeper, user, mockSystemOracle } = await loadFixture(deploy);
    //     const asset = "0x0000000000000000000000000000000000000011"

    //     await mockSystemOracle.setValues(
    //         (await ethers.provider.getBlock("latest")).number,
    //         [0, 0], ["100000000", "200000000"], [0, 0]
    //     )

    //     await aggregator.setAsset(asset, true, 0, 2, "0", false)
    //     expect(await aggregator.getPrice(asset)).to.be.above("0")
    // });

    it("should revert: stale non-perp asset", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);

        const stalePriceTime = await aggregator.MAX_EMA_STALE_SECONDS()
        await time.increase(stalePriceTime)

        await expect(
            aggregator.getPrice("0x0000000000000000000000000000000000000024")
        ).to.be.revertedWith("getPrice: stale EMA price")
    });

    it("should revert: getUpdateTimestamp for non-existent asset", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);

        await expect(
            aggregator.getUpdateTimestamp("0x0000000000000000000000000000000000000000")
        ).to.be.revertedWith("getUpdateTimestamp: asset not found")
    });

    it("should return block.timestamp in getUpdateTimestamp for perp asset", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);

        await aggregator.setAsset("0x0000000000000000000000000000000000000077", true, 2, 0, "0", false)

        const lastTimestamp = await time.latest();
        expect(await aggregator.getUpdateTimestamp("0x0000000000000000000000000000000000000077")).to.equal(lastTimestamp)
    });

    it("should return lastTimestamp in getUpdateTimestamp for perp asset", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"
        const price = "100000000"
        const beforeSubmitTimestamp = await time.latest();
        await aggregator.connect(keeper).submitRoundData([asset], [price], beforeSubmitTimestamp)

        const afterSubmitTimestamp = await time.latest();
        const details = await aggregator.assetDetails(asset)
        expect(await aggregator.getUpdateTimestamp(asset)).to.equal(details.lastTimestamp)
        expect(await aggregator.getUpdateTimestamp(asset)).to.equal(afterSubmitTimestamp)
    });
});
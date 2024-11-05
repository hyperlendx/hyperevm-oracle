const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Aggregator-AddAsset", function () {
    async function deploy() {
        const [owner, keeper, user] = await ethers.getSigners();

        const Aggregator = await ethers.getContractFactory("Aggregator");
        const aggregator = await Aggregator.deploy();

        return { aggregator, owner, keeper, user };
    }
  
    it("should revert: only owner can add assets", async function () {
        const { aggregator, keeper } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"
        const isPerpOracle = false;
        const metaIndex = 0;
        const metaDecimals = 0
        const price = "100000000"
        const isUpdate = false;

        await expect(
            aggregator.connect(keeper).setAsset(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate)
        ).to.be.revertedWithCustomError(aggregator, "OwnableUnauthorizedAccount")
    });

    it("should add new perp asset", async function () {
        const { aggregator, keeper } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"
        const isPerpOracle = true;
        const metaIndex = 1;
        const metaDecimals = 2;
        const price = "100000000";
        const isUpdate = false;

        await aggregator.setAsset(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate)
        expect((await aggregator.assetDetails(asset)).exists).to.equal(true)
        expect((await aggregator.assetDetails(asset)).isPerpOracle).to.equal(true)
        expect((await aggregator.assetDetails(asset)).metaIndex).to.equal(1)
        expect((await aggregator.assetDetails(asset)).metaDecimals).to.equal(2)
        expect((await aggregator.assetDetails(asset)).ema).to.equal(price)
    });

    it("should add new non-perp asset", async function () {
        const { aggregator, keeper } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"
        const isPerpOracle = false;
        const metaIndex = 1;
        const metaDecimals = 2;
        const price = "100000000";
        const isUpdate = false;

        await expect(aggregator.setAsset(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate))
            .to.emit(aggregator, "AssetChanged")
            .withArgs(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate)

        expect((await aggregator.assetDetails(asset)).exists).to.equal(true)
        expect((await aggregator.assetDetails(asset)).isPerpOracle).to.equal(false)
        expect((await aggregator.assetDetails(asset)).metaIndex).to.equal(1)
        expect((await aggregator.assetDetails(asset)).metaDecimals).to.equal(2)
        expect((await aggregator.assetDetails(asset)).ema).to.equal(price)

        expect(await aggregator.metaIndexes(metaIndex)).to.equal(asset)
    });

    it("should revert on duplicate assets", async function () {
        const { aggregator, keeper } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"
        const isPerpOracle = false;
        const metaIndex = 1;
        const metaDecimals = 2;
        const price = "100000000";
        const isUpdate = false;

        await aggregator.setAsset(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate)
        await expect(aggregator.setAsset(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate)).to.be.revertedWith("asset already exists")
    });

    it("should update asset", async function () {
        const { aggregator, keeper } = await loadFixture(deploy);
        let asset = "0x0000000000000000000000000000000000000024"
        let isPerpOracle = false;
        let metaIndex = 1;
        let metaDecimals = 2;
        let price = "100000000";
        let isUpdate = false;

        await expect(aggregator.setAsset(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate))
            .to.emit(aggregator, "AssetChanged")
            .withArgs(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate)
        expect(await aggregator.metaIndexes(1)).to.equal(asset)

        asset = "0x2220000000000000000000000000000000000024"
        isPerpOracle = false;
        metaIndex = 2;
        metaDecimals = 4;
        price = "200000000";
        isUpdate = true;
        await expect(aggregator.setAsset(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate))
            .to.emit(aggregator, "AssetChanged")
            .withArgs(asset, isPerpOracle, metaIndex, metaDecimals, price, isUpdate)  

        expect((await aggregator.assetDetails(asset)).exists).to.equal(true)
        expect((await aggregator.assetDetails(asset)).isPerpOracle).to.equal(false)
        expect((await aggregator.assetDetails(asset)).metaIndex).to.equal(2)
        expect((await aggregator.assetDetails(asset)).metaDecimals).to.equal(4)
        expect((await aggregator.assetDetails(asset)).ema).to.equal(price)

        expect(await aggregator.metaIndexes(2)).to.equal(asset)
    });
});
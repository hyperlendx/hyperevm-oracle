const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Aggregator", function () {
    async function deploy() {
        const [owner, otherAccount] = await ethers.getSigners();

        const systemOracle = await hre.ethers.getContractAt("SystemOracle", '0x1111111111111111111111111111111111111111');

        const Aggregator = await ethers.getContractFactory("Aggregator");
        const aggregator = await Aggregator.deploy();

        return { systemOracle, aggregator, owner, otherAccount };
    }

    it("should add an asset", async function () {
        const { aggregator } = await deploy();

        let asset = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
        let price = '5770000000000'

        await aggregator.setAsset(asset, false, 0, 0, price, false)

        expect((await aggregator.getPrice(asset)).toString()).to.equal(price)
    });

    it("should fail to add an asset if caller is not owner", async function () {
        const { aggregator, otherAccount } = await deploy();

        let asset = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
        let price = '5770000000000'

        await expect(aggregator.connect(otherAccount).setAsset(asset, false, 0, 0, price, false))
            .to.be.revertedWithCustomError(aggregator, `OwnableUnauthorizedAccount(address)`).withArgs(otherAccount.address);
    });

    it("should fail to add a keeper if caller is not owner", async function () {
        const { aggregator, otherAccount } = await deploy();

        await expect(aggregator.connect(otherAccount).toggleKeeper('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'))
            .to.be.revertedWithCustomError(aggregator, `OwnableUnauthorizedAccount(address)`).withArgs(otherAccount.address);
    });

    it("should add a keeper", async function () {
        const { aggregator, otherAccount } = await deploy();

        await aggregator.toggleKeeper('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599');

        expect(await aggregator.keepers('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599')).to.equal(true)
    });

    it("should revert if asset price is stale", async function () {
        const { aggregator, otherAccount } = await deploy();

        let asset = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
        let price = '5770000000000'
        await aggregator.setAsset(asset, false, 0, 0, price, false)

        await time.increase(1201);

        await expect(aggregator.getPrice(asset)).to.be.revertedWith("getPrice: stale EMA price")
    });

    it("should revert if asset does not exists", async function () {
        const { aggregator, otherAccount } = await deploy();
        await expect(aggregator.getPrice('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599')).to.be.revertedWith("getPrice: asset not found")
    });

    it("should update the EMA oracle prices", async function () {
        const { aggregator } = await deploy();

        let asset = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
        let price = '5770000000000'
        await aggregator.setAsset(asset, false, 0, 0, price, false)

        //prepare data
        await time.increase(60);
        let assets = ['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599']
        let prices = ['6000000000000']
        let timestamp = await time.latest();
        await aggregator.submitRoundData(assets, prices, timestamp)

        expect(await aggregator.getPrice(assets[0])).to.be.greaterThan(price)
        expect(await aggregator.getPrice(assets[0])).to.be.lessThan(prices[0])
    });
});
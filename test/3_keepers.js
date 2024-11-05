const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Aggregator-Keepers", function () {
    async function deploy() {
        const [owner, keeper, user] = await ethers.getSigners();

        const Aggregator = await ethers.getContractFactory("Aggregator");
        const aggregator = await Aggregator.deploy();

        return { aggregator, owner, keeper, user };
    }
  
    it("should revert: only owner can add keepers", async function () {
        const { aggregator, keeper } = await loadFixture(deploy);

        await expect(
            aggregator.connect(keeper).toggleKeeper(keeper.address)
        ).to.be.revertedWithCustomError(aggregator, "OwnableUnauthorizedAccount")
    });

    it("should add keeper", async function () {
        const { aggregator, keeper } = await loadFixture(deploy);

        await expect(aggregator.toggleKeeper(keeper.address))
            .to.emit(aggregator, "KeeperUpdated")
            .withArgs(keeper.address, true)

        expect(await aggregator.keepers(keeper.address)).to.equal(true)
    });

    it("should remove keeper and add it again", async function () {
        const { aggregator, keeper } = await loadFixture(deploy);

        await expect(aggregator.toggleKeeper(keeper.address))
            .to.emit(aggregator, "KeeperUpdated")
            .withArgs(keeper.address, true)
        expect(await aggregator.keepers(keeper.address)).to.equal(true)

        await expect(aggregator.toggleKeeper(keeper.address))
            .to.emit(aggregator, "KeeperUpdated")
            .withArgs(keeper.address, false)
        expect(await aggregator.keepers(keeper.address)).to.equal(false)

        await expect(aggregator.toggleKeeper(keeper.address))
            .to.emit(aggregator, "KeeperUpdated")
            .withArgs(keeper.address, true)
        expect(await aggregator.keepers(keeper.address)).to.equal(true)
    });
});
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Aggregator-Setup", function () {
    async function deploy() {
        const [owner, keeper, user] = await ethers.getSigners();

        const Aggregator = await ethers.getContractFactory("Aggregator");
        const aggregator = await Aggregator.deploy();

        return { aggregator, owner, keeper, user };
    }
  
    it("should set owner", async function () {
        const { aggregator, owner } = await loadFixture(deploy);
        expect((await aggregator.owner()).toString()).to.equal(owner.address)
    });

    it("should use correct system oracle", async function () {
        const { aggregator } = await loadFixture(deploy);
        expect(await aggregator.systemOracle()).to.equal("0x1111111111111111111111111111111111111111")
    });
});
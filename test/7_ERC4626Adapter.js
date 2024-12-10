const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("ERC4626Adapter", function () {
    async function deploy() {
        const [owner, keeper, user] = await ethers.getSigners();

        const MockPriceProvider = await ethers.getContractFactory("MockPriceProvider");
        const mockPriceProvider = await MockPriceProvider.deploy("150000000000");

        const MockERC4626 = await ethers.getContractFactory("MockERC4626");
        const mockERC4626 = await MockERC4626.deploy();

        const ERC4626Adapter = await ethers.getContractFactory("ERC4626Adapter");
        const erc4626Adapter = await ERC4626Adapter.deploy(
            mockPriceProvider.target, "MOCK", mockERC4626.target
        );

        return { mockPriceProvider, erc4626Adapter, mockERC4626, owner, keeper, user };
    }
  
    it("should return valid price", async function () {
        const { mockPriceProvider, erc4626Adapter, mockERC4626, owner, keeper, user } = await loadFixture(deploy);

        const baseShare = BigInt(Math.pow(10, Number(await mockERC4626.decimals())))
        const assetsPerBaseShare = await mockERC4626.convertToAssets(baseShare);

        let [
            roundId,
            answer,
            startedAt,
            updatedAt,
            answeredInRound
        ] = await erc4626Adapter.latestRoundData();

        const expectedPrice = Number(await mockPriceProvider.price()) * Number(assetsPerBaseShare) / Number(baseShare);
        const expectedPriceRoundedDown = Math.floor(expectedPrice).toFixed(0);

        expect(answer.toString()).to.equal(expectedPriceRoundedDown)
    });
});
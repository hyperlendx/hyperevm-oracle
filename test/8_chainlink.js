const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ChainLink", function () {
    const report = '0x00090d9e8d96765a0c49e03a6ae05c82e8f8de70cf179baa632f18313e54bd69000000000000000000000000000000000000000000000000000000000017b1f3000000000000000000000000000000000000000000000000000000030000000100000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000280010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001200003cbac760d50c462267f3127374f5fa039eb971dd4a58a2b4f2b664769f8ea00000000000000000000000000000000000000000000000000000000682c9ac800000000000000000000000000000000000000000000000000000000682c9ac8000000000000000000000000000000000000000000000000000075975d1667c20000000000000000000000000000000000000000000000000049723fe17d9c1400000000000000000000000000000000000000000000000000000000685427c8000000000000000000000000000000000000000000000001665413914410094c0000000000000000000000000000000000000000000000016640fe7bc3e75fa0000000000000000000000000000000000000000000000001666728b2d714fbc80000000000000000000000000000000000000000000000000000000000000002d79865f3f5ee7a64565c1d57e79760012c5f30cccda239e0ff6136717fc3412d2cbd5b6e4b0d709cca8e6711342fc3a998da6bce861999cbecc4421523c4f01d0000000000000000000000000000000000000000000000000000000000000002590ece0bf65dc8a8d541f3c40fdd34b4130c98305db3b2011edb5195254bf798068f76c026d79da953f252c6c936e4c16e3db94e7a6b6121228d84b00948715b'
    const feedId = '0x0003cbac760d50c462267f3127374f5fa039eb971dd4a58a2b4f2b664769f8ea'

    async function deploy() {
        const [owner, user] = await ethers.getSigners();

        const MockVerifier = await ethers.getContractFactory("MockChainlinkVerifier");
        const mockVerifier = await MockVerifier.deploy();

        const Consumer = await ethers.getContractFactory("ChainlinkConsumer");
        const consumer = await Consumer.deploy(mockVerifier.target);

        const donDecimals = 18
        const SingleFeedProvider = await ethers.getContractFactory("SingleFeedProvider");
        const singleProvider = await SingleFeedProvider.deploy(consumer.target, feedId, donDecimals);

        return { mockVerifier, consumer, singleProvider };
    }
  
    it("should verify a report on ChainlinkConsumer", async function () {
        const { mockVerifier, consumer } = await loadFixture(deploy);

        const verifier = await consumer.s_verifierProxy();
        expect(verifier).to.equal(mockVerifier.target)

        await consumer.verifyReport(report)

        const answer = await consumer.getLatestAnswer(feedId);
        const timestamp = await consumer.getLatestTimestamp(feedId);

        expect(answer.toString()).to.equal("25820284078254983500") //as string, to avoid bignumber issues
        expect(timestamp).to.equal(1747753672)
    });

    it("should read data from SingleFeedProvider", async function () {
        const { mockVerifier, consumer, singleProvider } = await loadFixture(deploy);

        //no data was stored yet
        expect(await singleProvider.latestAnswer()).to.equal(0)

        await consumer.verifyReport(report)

        const expectedPrice = "2582028407";
        const expectedTimestamp = 1747753672

        expect(await singleProvider.decimals()).to.equal(8)
        expect((await singleProvider.latestAnswer()).toString()).to.equal(expectedPrice)
        expect(await singleProvider.latestTimestamp()).to.equal(expectedTimestamp)
        expect((await singleProvider.getAnswer(1)).toString()).to.equal(expectedPrice)
        expect(await singleProvider.getTimestamp(1)).to.equal(expectedTimestamp)

        let roundData = await singleProvider.latestRoundData()
        expect(roundData[0]).to.equal(expectedTimestamp)
        expect(roundData[1].toString()).to.equal(expectedPrice)
        expect(roundData[2]).to.equal(expectedTimestamp)
        expect(roundData[3]).to.equal(expectedTimestamp)
        expect(roundData[4]).to.equal(expectedTimestamp)
    });
});
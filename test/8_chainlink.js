const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ChainLink", function () {
    const report = '0x00090d9e8d96765a0c49e03a6ae05c82e8f8de70cf179baa632f18313e54bd69000000000000000000000000000000000000000000000000000000000017b1f3000000000000000000000000000000000000000000000000000000030000000100000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000280010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001200003cbac760d50c462267f3127374f5fa039eb971dd4a58a2b4f2b664769f8ea00000000000000000000000000000000000000000000000000000000682c9ac800000000000000000000000000000000000000000000000000000000682c9ac8000000000000000000000000000000000000000000000000000075975d1667c20000000000000000000000000000000000000000000000000049723fe17d9c1400000000000000000000000000000000000000000000000000000000685427c8000000000000000000000000000000000000000000000001665413914410094c0000000000000000000000000000000000000000000000016640fe7bc3e75fa0000000000000000000000000000000000000000000000001666728b2d714fbc80000000000000000000000000000000000000000000000000000000000000002d79865f3f5ee7a64565c1d57e79760012c5f30cccda239e0ff6136717fc3412d2cbd5b6e4b0d709cca8e6711342fc3a998da6bce861999cbecc4421523c4f01d0000000000000000000000000000000000000000000000000000000000000002590ece0bf65dc8a8d541f3c40fdd34b4130c98305db3b2011edb5195254bf798068f76c026d79da953f252c6c936e4c16e3db94e7a6b6121228d84b00948715b'
    const report_2 = '0x00090d9e8d96765a0c49e03a6ae05c82e8f8de70cf179baa632f18313e54bd69000000000000000000000000000000000000000000000000000000000017c8c5000000000000000000000000000000000000000000000000000000030000000100000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000280000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001200003cbac760d50c462267f3127374f5fa039eb971dd4a58a2b4f2b664769f8ea00000000000000000000000000000000000000000000000000000000682ca4c800000000000000000000000000000000000000000000000000000000682ca4c80000000000000000000000000000000000000000000000000000752d001f63200000000000000000000000000000000000000000000000000048f30bf4c54ce900000000000000000000000000000000000000000000000000000000685431c800000000000000000000000000000000000000000000000166f193631b38219000000000000000000000000000000000000000000000000166d4e7d29defb16000000000000000000000000000000000000000000000000167136983b01d8788000000000000000000000000000000000000000000000000000000000000000247c3a0cb3ab78ac5e1985c6e04c2121a7b8b37c77cc3634d85af40f2c2c1af9aa16f6c99282083c40e988906ad7e89c22d562da173920a8308e412e3298c28030000000000000000000000000000000000000000000000000000000000000002713ebeb0c2efc4e7b3bab29a9ee67cbb3d241d95f0b87baa44a25ef4dcd749a145dc7a58efa45fca4dd481f6800c88ac8b54f5488c8400682f570c8fd3b8c6bb'
    const report_btc = '0x00090d9e8d96765a0c49e03a6ae05c82e8f8de70cf179baa632f18313e54bd69000000000000000000000000000000000000000000000000000000000017f533000000000000000000000000000000000000000000000000000000030000000100000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002800100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012000037da06d56d083fe599397a4769a042d63aa73dc4ef57709d31e9971a5b43900000000000000000000000000000000000000000000000000000000682cb84000000000000000000000000000000000000000000000000000000000682cb8400000000000000000000000000000000000000000000000000000748ad43c4b630000000000000000000000000000000000000000000000000048f5f2e7165580000000000000000000000000000000000000000000000000000000006854454000000000000000000000000000000000000000000000167913de413a0219d8000000000000000000000000000000000000000000000016790b4b1dd2d08a10000000000000000000000000000000000000000000000016791c5fa127fbc92000000000000000000000000000000000000000000000000000000000000000000231deef69738b8cfc1a0318684256791b782da4ad05a8448281277f4052516364d4db9d816191bffb09087a8c59f56758f43d10f69151379f7ec6b02aabc8aafb0000000000000000000000000000000000000000000000000000000000000002182fcdacf921e9ef56322049e017531cb8109ae21115dcfed70364a92f87aff37a0b195e3fab9785152f21c7cb50a86313e5c9e98c8ee7ea46337deac5ae4866'

    const feedId_hype = '0x0003cbac760d50c462267f3127374f5fa039eb971dd4a58a2b4f2b664769f8ea'
    const feedId_btc = '0x00037da06d56d083fe599397a4769a042d63aa73dc4ef57709d31e9971a5b439'

    async function deploy() {
        const [owner, user] = await ethers.getSigners();

        const MockVerifier = await ethers.getContractFactory("MockChainlinkVerifier");
        const mockVerifier = await MockVerifier.deploy();

        const Consumer = await ethers.getContractFactory("ChainlinkConsumer");
        const consumer = await Consumer.deploy(mockVerifier.target);

        const donDecimals = 18
        const SingleFeedProvider = await ethers.getContractFactory("SingleFeedProvider");
        const singleProvider = await SingleFeedProvider.deploy(consumer.target, feedId_hype, donDecimals);

        return { mockVerifier, consumer, singleProvider };
    }
  
    it("should verify a report on ChainlinkConsumer", async function () {
        const { mockVerifier, consumer } = await loadFixture(deploy);

        const verifier = await consumer.s_verifierProxy();
        expect(verifier).to.equal(mockVerifier.target)

        await consumer.verifyReport(report)

        const answer = await consumer.getLatestAnswer(feedId_hype);
        const timestamp = await consumer.getLatestTimestamp(feedId_hype);

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

    it("should owerwrite data with new report", async function () {
        const { mockVerifier, consumer, singleProvider } = await loadFixture(deploy);

        const verifier = await consumer.s_verifierProxy();
        expect(verifier).to.equal(mockVerifier.target)

        //first report
        await consumer.verifyReport(report)
        const answer = await consumer.getLatestAnswer(feedId_hype);
        const timestamp = await consumer.getLatestTimestamp(feedId_hype);
        expect(answer.toString()).to.equal("25820284078254983500") //as string, to avoid bignumber issues
        expect(timestamp).to.equal(1747753672)

        //second report
        await consumer.verifyReport(report_2)
        const answer_2 = await consumer.getLatestAnswer(feedId_hype);
        const timestamp_2 = await consumer.getLatestTimestamp(feedId_hype);
        expect(answer_2.toString()).to.equal("25864616188833178000") //as string, to avoid bignumber issues
        expect(timestamp_2).to.equal(1747756232)

        //verify on sigleProvider
        const expectedPrice = "2586461618";
        const expectedTimestamp = 1747756232
        expect((await singleProvider.latestAnswer()).toString()).to.equal(expectedPrice)
        expect(await singleProvider.latestTimestamp()).to.equal(expectedTimestamp)
        expect((await singleProvider.getAnswer(1)).toString()).to.equal(expectedPrice)
        expect(await singleProvider.getTimestamp(1)).to.equal(expectedTimestamp)
    });

    it("should verify a batch of reports", async function () {
        const { mockVerifier, consumer, singleProvider } = await loadFixture(deploy);

        expect((await consumer.getLatestAnswer(feedId_hype)).toString()).to.equal('0')
        expect((await consumer.getLatestAnswer(feedId_btc)).toString()).to.equal('0')

        await consumer.verifyBatch([report, report_btc])

        expect((await consumer.getLatestAnswer(feedId_hype)).toString()).to.equal('25820284078254983500')
        expect((await consumer.getLatestAnswer(feedId_btc)).toString()).to.equal('106125550309500000000000')
    });
});
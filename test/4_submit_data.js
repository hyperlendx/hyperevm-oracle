const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Aggregator-SubmitData", function () {
    async function deploy() {
        const [owner, keeper, user] = await ethers.getSigners();

        const Aggregator = await ethers.getContractFactory("Aggregator");
        const aggregator = await Aggregator.deploy();

        await aggregator.toggleKeeper(keeper.address)
        await aggregator.setAsset("0x0000000000000000000000000000000000000024", false, 1, 1, "0", false)

        return { aggregator, owner, keeper, user };
    }
  
    it("should revert: only keepers can submit data", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);

        const asset = "0x0000000000000000000000000000000000000024"
        const price = "100000000"
        const timestamp = parseFloat(new Date().getTime() / 1000).toFixed(0)
        await expect(
            aggregator.connect(user).submitRoundData([asset], [price], timestamp)
        ).to.be.revertedWith("only keepers")
    });

    it("should submit data", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);

        const asset = "0x0000000000000000000000000000000000000024"
        const price = "100000000"
        const timestamp = parseFloat(new Date().getTime() / 1000).toFixed(0)
        await expect(aggregator.connect(keeper).submitRoundData([asset], [price], timestamp))
            .to.emit(aggregator, "RoundDataSubmitted")
            .withArgs([asset], [price], anyValue)

        expect(await aggregator.getPrice(asset)).to.be.above("0")
        expect(await aggregator.getUpdateTimestamp(asset)).to.be.above(timestamp)
    });

    it("should revert: array length missmatch", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);

        const asset = "0x0000000000000000000000000000000000000024"
        const prices = ["100000000", "2"]
        const timestamp = parseFloat(new Date().getTime() / 1000).toFixed(0)
        await expect(aggregator.connect(keeper).submitRoundData([asset], prices, timestamp)).to.be.revertedWith("submitRoundData: length mismatch")
    });

    it("should revert: expired data", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"
        const maxDelay = Number(await aggregator.MAX_TIMESTAMP_DELAY_SECONDS())
        const timestamp = parseFloat(new Date().getTime() / 1000).toFixed(0) - maxDelay - 1
        await expect(aggregator.connect(keeper).submitRoundData([asset], ["100000000"], timestamp)).to.be.revertedWith("submitRoundData: expired")
    });

    it("should revert: timestamp in the future", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"
        const timestamp = parseFloat(new Date().getTime() / 1000).toFixed(0) + 1000
        await expect(aggregator.connect(keeper).submitRoundData([asset], ["100000000"], timestamp)).to.be.revertedWithPanic("0x11") //overflow
    });

    it("should calculate correct EMA on first round", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"

        const detailsBeforeUpdate = await aggregator.assetDetails(asset)

        const timestamp = parseFloat(new Date().getTime() / 1000).toFixed(0)
        const newPrice = 100000000
        await aggregator.connect(keeper).submitRoundData([asset], [newPrice], timestamp)

        //calculate EMA
        let currentTimestamp = await time.latest();
        let tau = Number(await aggregator.EMA_WINDOW_SECONDS())
        let w = Math.exp(-(Number(currentTimestamp) - Number(detailsBeforeUpdate.lastTimestamp)) / tau);
        let expectedEma = Math.floor(Number(detailsBeforeUpdate.ema) * w + newPrice * (1 - w))

        expect(await aggregator.getPrice(asset)).to.equal(expectedEma)
    });

    it("should calculate correct EMA during multiple round", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"

        const prices = [100000000, 150000000, 90000000, 220000000, 8000000000]
        const timeIncrease = 60

        for (let i in prices){
            const detailsBeforeUpdate = await aggregator.assetDetails(asset)
            const timestamp = parseFloat(new Date().getTime() / 1000 + (Number(i) * timeIncrease)).toFixed(0)
            await aggregator.connect(keeper).submitRoundData([asset], [prices[i]], timestamp)
    
            //calculate EMA
            let currentTimestamp = await time.latest();
            let tau = Number(await aggregator.EMA_WINDOW_SECONDS())
            let w = Math.exp(-(Number(currentTimestamp) - Number(detailsBeforeUpdate.lastTimestamp)) / tau);
            let expectedEma = Math.floor(Number(detailsBeforeUpdate.ema) * w + prices[i] * (1 - w))
    
            expect(await aggregator.getPrice(asset)).to.equal(expectedEma)
            await time.increase(timeIncrease);
        }
    });

    it("should calculate correct EMA during multiple round with different intervals", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);
        const asset = "0x0000000000000000000000000000000000000024"

        const prices = [100000000, 150000000, 90000000, 220000000, 8000000000, 10000000, 8000000]
        const timeIncrease = [50, 60, 110, 40, 500, 400, 11]

        for (let i in prices){
            let beforeSubmitTimestamp = await time.latest();
            const detailsBeforeUpdate = await aggregator.assetDetails(asset)
            await aggregator.connect(keeper).submitRoundData([asset], [prices[i]], beforeSubmitTimestamp)
    
            //calculate EMA
            let currentTimestamp = await time.latest();
            let tau = Number(await aggregator.EMA_WINDOW_SECONDS())
            let w = Math.exp(-(Number(currentTimestamp) - Number(detailsBeforeUpdate.lastTimestamp)) / tau);
            let expectedEma = Math.floor(Number(detailsBeforeUpdate.ema) * w + prices[i] * (1 - w))
    
            expect(await aggregator.getPrice(asset)).to.equal(expectedEma)
            await time.increase(timeIncrease[i]);
        }
    });

    it("should calculate correct EMA during multiple round with different intervals and multiple assets", async function () {
        const { aggregator, keeper, user } = await loadFixture(deploy);
        const assets = [
            "0x0000000000000000000000000000000000000024",
            "0x0000000000000000000000000000000000000025",
            "0x0000000000000000000000000000000000000026",
            "0x0000000000000000000000000000000000000027"
        ]
        for (let asset of assets){
            await aggregator.setAsset(asset, false, 1, 1, "0", true) 
        }

        const prices = [
            [ 84736283947, 57382910473, 19283746502, 10000000082 ],
            [ 38475629100, 91827364510, 10293847566, 56473829102 ],
            [ 28374659281, 83746592810, 19283746501, 56473829102 ],
            [ 91827364510, 38475629100, 84736283947, 19283746502 ],
            [ 10293847566, 57382910473, 91827364510, 28374659281 ]
        ]
        const timeIncrease = [50, 60, 110, 40, 500, 400, 11]

        for (let i in prices){
            let beforeSubmitTimestamp = await time.latest();
            const detailsBeforeUpdate = await Promise.all(assets.map(async (e) => {return await aggregator.assetDetails(e)}))
            await aggregator.connect(keeper).submitRoundData(assets, prices[i], beforeSubmitTimestamp)
            
            for (let j in assets){
                //calculate EMA for each asset
                let currentTimestamp = await time.latest();
                let tau = Number(await aggregator.EMA_WINDOW_SECONDS())
                let w = Math.exp(-(Number(currentTimestamp) - Number(detailsBeforeUpdate[j].lastTimestamp)) / tau);
                let expectedEma = Math.floor(Number(detailsBeforeUpdate[j].ema) * w + prices[i][j] * (1 - w))
        
                expect(await aggregator.getPrice(assets[j])).to.equal(expectedEma)
            }
            await time.increase(timeIncrease[i]);
        }
    });
});
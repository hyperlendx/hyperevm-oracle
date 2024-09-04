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

    return { systemOracle, aggregator };
  }

  it("should add an asset", async function () {
    const { systemOracle, aggregator } = await deploy();

    let asset = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
    let price = '5770000000000'

    await aggregator.setAsset(asset, false, 0, 0, price, false)

    expect((await aggregator.getPrice(asset)).toString() == price)

    let assets = ['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599']
    let prices = ['6000000000000']
    let timestamp = Math.floor(new Date().getTime() / 1000)

    await aggregator.submitRoundData(assets, prices, timestamp)

    console.log(await aggregator.getPrice(assets[0]))
  });

//   it("should update the EMA oracle prices", async function () {
//     const { systemOracle, aggregator } = await deploy();

//     let assets = ['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599']
//     let prices = ['6000000000000']
//     let timestamp = Math.floor(new Date().getTime() / 1000)

//     await aggregator.submitRoundData(assets, prices, timestamp)

//     console.log(await aggregator.getPrice(assets[0]))

//   });
});

const hre = require("hardhat");

const { verify } = require("../utils/verify")

main(
    '0x377280bB72e75e7aF763B98c35a75E873bbe49b8', //primary
    '0x83721238b50DD9232E5b48EaF191001E3cb118dd', //secondary
    '0x4cEC96A68cb9A979621b104F3C94884be1a66da0', //emergency
    '0x10914Ee2C2dd3F3dEF9EFFB75906CA067700a04A', //acl
    'wstHYPE-prim:redstone/fundam-sec:chainlink/fundam-emerg:redstone/market', //desc
    '25200', //max int primary
    '25200' //max int secondary
)

async function main(
    _primarySource,
    _fallbackSource,
    _emergencySource,
    _aclManager,
    _description,
    _maxIntervalPrimary,
    _maxIntervalFallback
) {
    const contract = await hre.ethers.deployContract("DualFallbackOracle", [
        _primarySource,
        _fallbackSource,
        _emergencySource,
        _aclManager,
        _description,
        _maxIntervalPrimary,
        _maxIntervalFallback
    ]);

    console.log(`DualOracle:`, contract)

    await contract.waitForDeployment();
    await verify(contract.target, [
        _primarySource,
        _fallbackSource,
        _emergencySource,
        _aclManager,
        _description,
        _maxIntervalPrimary,
        _maxIntervalFallback
    ])

    return contract
}

module.exports.main = main

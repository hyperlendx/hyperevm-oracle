// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "./utils/Ownable.sol";
import { ISystemOracle } from "./interfaces/ISystemOracle.sol";

contract Aggregator is Ownable {
    ISystemOracle public systemOracle = ISystemOracle(0x1111111111111111111111111111111111111111);

    struct AssetDetails {
        bool exists;
        uint256 metaIndex;
        uint256 metaDecimals;
    }

    mapping(address => AssetDetails) public assetDetails;

    constructor() Ownable(msg.sender) {}

    function setAsset(address _asset, uint256 _metaIndex, uint256 _metaDecimals, bool isUpdate) external onlyOwner() {
        if (!isUpdate) {
            require(assetDetails[_asset].exists == false, "asset already exists");
        }

        assetDetails[_asset] = AssetDetails({
            exists: true,
            metaIndex: _metaIndex,
            metaDecimals: _metaDecimals
        });
    }

    function getPrice(address _asset) external view returns (uint256){
        require(assetDetails[_asset].exists == true, "asset not found");

        uint256[] memory oraclePrices = systemOracle.getOraclePxs();
        uint256 _metaIndex = assetDetails[_asset].metaIndex;

        uint256 _price = oraclePrices[_metaIndex];
        uint256 _decimals = assetDetails[_asset].metaDecimals;

        return _price * (10**8) / (10**(6 - _decimals)); //normalize to 8 decimals
    }
}
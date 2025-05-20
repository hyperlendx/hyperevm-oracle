// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockChainlinkVerifier {
    function verify(bytes calldata signedReport, bytes calldata) external payable returns (bytes memory verifierResponse) {
        (
            bytes32[3] memory reportContext,
            bytes memory reportData,
            bytes32[] memory rs,
            bytes32[] memory ss,
            bytes32 rawVs
        ) = abi.decode(signedReport, (bytes32[3], bytes, bytes32[], bytes32[], bytes32));

        return reportData;
    }
}

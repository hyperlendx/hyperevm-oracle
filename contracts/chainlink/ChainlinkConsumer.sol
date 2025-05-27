// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Common} from "@chainlink/contracts/src/v0.8/llo-feeds/libraries/Common.sol";
import {IRewardManager} from "@chainlink/contracts/src/v0.8/llo-feeds/v0.3.0/interfaces/IRewardManager.sol";
import {IVerifierFeeManager} from "@chainlink/contracts/src/v0.8/llo-feeds/v0.3.0/interfaces/IVerifierFeeManager.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

import {IVerifierProxy} from "./interfaces/IVerifierProxy.sol";
import {IFeeManager} from "./interfaces/IFeeManager.sol";

using SafeERC20 for IERC20;

/// @title ChainlinkConsumer
/// @author HyperLend
/// @notice Contract collecting and verifying Chainlink Data Streams
/// @dev Exposes latest price and timestamp for each feedId, which is then consumed by SingleFeedProvider.sol
contract ChainlinkConsumer {
    /// @notice Thrown when a caller tries to execute a function that is restricted to the contract's owner.
    error NotOwner(address caller);
    /// @notice Thrown when an unsupported report version is provided to verifyReport.
    error InvalidReportVersion(uint16 version);
    /// @notice Thrown if RWA market is not open
    error MarketNotOpen(bytes32 feedId, uint32 marketStatus);
    /// @notice Thrown if new timestamp would be older than the previous timestamp
    error OldData(bytes32 feedId, uint256 reportTimestamp, uint256 previousTimestamp);

    /**
     * @dev Represents a data report from a Data Streams stream for v3 schema (crypto streams).
     * The `price`, `bid`, and `ask` values are carried to either 8 or 18 decimal places, depending on the stream.
     * For more information, see https://docs.chain.link/data-streams/crypto-streams and https://docs.chain.link/data-streams/reference/report-schema
     */
    struct ReportV3 {
        bytes32 feedId; // The stream ID the report has data for.
        uint32 validFromTimestamp; // Earliest timestamp for which price is applicable.
        uint32 observationsTimestamp; // Latest timestamp for which price is applicable.
        uint192 nativeFee; // Base cost to validate a transaction using the report, denominated in the chain’s native token (e.g., WETH/ETH).
        uint192 linkFee; // Base cost to validate a transaction using the report, denominated in LINK.
        uint32 expiresAt; // Latest timestamp where the report can be verified onchain.
        int192 price; // DON consensus median price (8 or 18 decimals).
        int192 bid; // Simulated price impact of a buy order up to the X% depth of liquidity utilisation (8 or 18 decimals).
        int192 ask; // Simulated price impact of a sell order up to the X% depth of liquidity utilisation (8 or 18 decimals).
    }

    /**
     * @dev Represents a data report from a Data Streams stream for v4 schema (RWA stream).
     * The `price` value is carried to either 8 or 18 decimal places, depending on the stream.
     * The `marketStatus` indicates whether the market is currently open. Possible values: `0` (`Unknown`), `1` (`Closed`), `2` (`Open`).
     * For more information, see https://docs.chain.link/data-streams/rwa-streams and https://docs.chain.link/data-streams/reference/report-schema-v4
     */
    struct ReportV4 {
        bytes32 feedId; // The stream ID the report has data for.
        uint32 validFromTimestamp; // Earliest timestamp for which price is applicable.
        uint32 observationsTimestamp; // Latest timestamp for which price is applicable.
        uint192 nativeFee; // Base cost to validate a transaction using the report, denominated in the chain’s native token (e.g., WETH/ETH).
        uint192 linkFee; // Base cost to validate a transaction using the report, denominated in LINK.
        uint32 expiresAt; // Latest timestamp where the report can be verified onchain.
        int192 price; // DON consensus median benchmark price (8 or 18 decimals).
        uint32 marketStatus; // The DON's consensus on whether the market is currently open.
    }

    /// @notice The VerifierProxy contract used for report verification.
    IVerifierProxy public s_verifierProxy;

    /// @notice The owner of the contract.
    address private s_owner;

    /// @notice Stores the last decoded price from a verified report for each feedId
    mapping(bytes32 => int192) public lastDecodedPrice;
    /// @notice Stores the last decoded timestamp from a verified report for each feedId
    mapping(bytes32 => uint256) public lastDecodedTimestamp;

    /// @notice Event emitted when a report is successfully verified and decoded.
    event DecodedReport(bytes32 feedId, int192 price, uint256 timestamp);

    /// @param _verifierProxy The address of the VerifierProxy contract.
    /// @dev You can find these addresses on https://docs.chain.link/data-streams/crypto-streams.
    constructor(address _verifierProxy) {
        s_owner = msg.sender;
        s_verifierProxy = IVerifierProxy(_verifierProxy);
    }

    /// @notice Checks if the caller is the owner of the contract.
    modifier onlyOwner() {
        if (msg.sender != s_owner) revert NotOwner(msg.sender);
        _;
    }

    /**
     * @notice Verifies an unverified data report and stores its contents, supporting both v3 and v4 report schemas.
     * @dev Performs the following steps:
     * - Decodes the unverified report to extract the report data.
     * - Extracts the report version by reading the first two bytes of the report data.
     *   - The first two bytes correspond to the schema version encoded in the stream ID.
     *   - Schema version `0x0003` corresponds to report version 3 (for Crypto assets).
     *   - Schema version `0x0004` corresponds to report version 4 (for Real World Assets).
     * - Validates that the report version is either 3 or 4; reverts with `InvalidReportVersion` otherwise.
     * - Retrieves the fee manager and reward manager contracts.
     * - Calculates the fee required for report verification using the fee manager.
     * - Approves the reward manager to spend the calculated fee amount.
     * - Verifies the report via the VerifierProxy contract.
     * - Decodes the verified report data into the appropriate report struct (`ReportV3` or `ReportV4`) based on the report version.
     * - Emits a `DecodedPrice` event with the price extracted from the verified report.
     * - Updates the `lastDecodedPrice` and `lastDecodedTimestamp` state variables with the data from the verified report.
     * @param unverifiedReport The encoded report data to be verified, including the signed report and metadata.
     * @custom:reverts InvalidReportVersion(uint8 version) Thrown when an unsupported report version is provided.
     */
    function verifyReport(bytes memory unverifiedReport) public payable {
        // Decode unverified report to extract report data
        (, bytes memory reportData) = abi.decode(
            unverifiedReport,
            (bytes32[3], bytes)
        );

        // Extract report version from reportData
        uint16 reportVersion = (uint16(uint8(reportData[0])) << 8) |
            uint16(uint8(reportData[1]));

        // Validate report version
        if (reportVersion != 3 && reportVersion != 4) {
            revert InvalidReportVersion(uint8(reportVersion));
        }

        // Send the payment if needed
        address feeToken = _processPayment(reportData);

        // Verify the report through the VerifierProxy
        bytes memory verifiedReportData = s_verifierProxy.verify(
            unverifiedReport,
            abi.encode(feeToken)
        );

        // Decode verified report data into the appropriate Report struct based on reportVersion
        if (reportVersion == 3) {
            // v3 report schema
            ReportV3 memory verifiedReport = abi.decode(
                verifiedReportData,
                (ReportV3)
            );

            // Calculate the average timestamp and revert if it's older than the last verified timestamp
            uint256 avgTimestamp = (verifiedReport.validFromTimestamp + verifiedReport.observationsTimestamp) / 2;
            if (lastDecodedTimestamp[verifiedReport.feedId] > avgTimestamp){
                revert OldData(verifiedReport.feedId, avgTimestamp, lastDecodedTimestamp[verifiedReport.feedId]);
            }

            // Store the price & timestamp from the report
            lastDecodedPrice[verifiedReport.feedId] = verifiedReport.price;
            lastDecodedTimestamp[verifiedReport.feedId] = avgTimestamp;

            // Log price from the verified report
            emit DecodedReport(verifiedReport.feedId, verifiedReport.price, avgTimestamp);
        } else if (reportVersion == 4) {
            // v4 report schema
            ReportV4 memory verifiedReport = abi.decode(
                verifiedReportData,
                (ReportV4)
            );
            
            // Revert if the market status is not `Open`
            if (verifiedReport.marketStatus != 2){
                revert MarketNotOpen(verifiedReport.feedId, verifiedReport.marketStatus);
            }

            // Calculate the average timestamp and revert if it's older than the last verified timestamp
            uint256 avgTimestamp = (verifiedReport.validFromTimestamp + verifiedReport.observationsTimestamp) / 2;
            if (lastDecodedTimestamp[verifiedReport.feedId] > avgTimestamp){
                revert OldData(verifiedReport.feedId, avgTimestamp, lastDecodedTimestamp[verifiedReport.feedId]);
            }

            // Store the price & timestamp from the report
            lastDecodedPrice[verifiedReport.feedId] = verifiedReport.price;
            lastDecodedTimestamp[verifiedReport.feedId] = avgTimestamp;

            // Log price from the verified report
            emit DecodedReport(verifiedReport.feedId, verifiedReport.price, avgTimestamp);
        }
    }

    /// @notice process the fee payment if needed
    function _processPayment(bytes memory reportData) internal returns (address) {
        // Retrieve fee manager
        IFeeManager feeManager = IFeeManager(
            address(s_verifierProxy.s_feeManager())
        );

        if (address(feeManager) != address(0)){
            // Retrieve reward manager
            IRewardManager rewardManager = IRewardManager(
                address(feeManager.i_rewardManager())
            );

            // Set the fee token address
            address feeTokenAddress = feeManager.i_linkAddress();

            // Calculate the fee required for report verification
            (Common.Asset memory fee, , ) = feeManager.getFeeAndReward(
                address(this),
                reportData,
                feeTokenAddress
            );

            // Approve rewardManager to spend this contract's balance in fees
            IERC20(feeTokenAddress).safeIncreaseAllowance(address(rewardManager), fee.amount);

            return feeTokenAddress;
        }

        return address(0);
    }

    /// @notice verify multipler reports in one transactions
    /// @param batch an array of DON reports
    function verifyBatch(bytes[] memory batch) external {
        for (uint256 i = 0; i < batch.length; i++){
            verifyReport(batch[i]);
        }
    }

    /// @notice used to read the latest price data for a given feedId
    /// @param feedId id of the price feed
    function getLatestAnswer(bytes32 feedId) external view returns (int256) {
        return int256(lastDecodedPrice[feedId]);
    }

    /// @notice used to read the latest timestamp data for a given feedId
    /// @param feedId id of the price feed
    function getLatestTimestamp(bytes32 feedId) external view returns (uint256) {
        return lastDecodedTimestamp[feedId];
    }

    /**
     * @notice Withdraws all tokens of a specific ERC20 token type to a beneficiary address.
     * @dev Utilizes SafeERC20's safeTransfer for secure token transfer.
     * @param _beneficiary Address to which the tokens will be sent. Must not be the zero address.
     * @param _token Address of the ERC20 token to be withdrawn. Must be a valid ERC20 token contract or address(0) for native tokens.
    */
    function withdrawToken(
        address  _beneficiary,
        address _token
    ) public onlyOwner {
        if (_token == address(0)) {
            (bool sent, ) = payable(_beneficiary).call{value: address(this).balance }("");
            require(sent, "Failed to send native");
        } else {
            uint256 amount = IERC20(_token).balanceOf(address(this));
            IERC20(_token).safeTransfer(_beneficiary, amount);
        }
    }
}

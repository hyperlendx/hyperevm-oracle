// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IAggregator } from "../interfaces/IAggregator.sol";
import { IAdapter } from "../interfaces/IAdapter.sol";
import { IOracle } from "../interfaces/IOracle.sol";
import { IERC4626 } from "../interfaces/IERC4626.sol";
import { IERC20 } from "../interfaces/IERC20.sol";
import { IACLManager } from "../interfaces/IACLManager.sol";

///@title DualFallbackOracle
///@author HyperLend
///@notice An dual-oracle system with fallback in case of main oracle outage
/* Contract has 3 possible oracles:
    - primary: used most of the time
    - fallback: used if primary is unhealthy
    - emergency: used when manually toggled by HyperLend poolAdmin / emergencyAdmin / riskAdmin

    If primary is healthy (price > 0 && data age < MAX_INTERVAL), return primary prices.
    Otherwise, check if fallback is healthy:
        - if it is, return fallback prices
        - if it's not, return primary prices (even if they are also unhealthy)

    Example:
        - primary: kHYPE-market-redstone
        - secondary: kHYPE-market-chainlink
        - emergency: kHYPE-fundamental-redstone (if we think kHYPE might depeg on secondary markets but there are no underlying issues (like 10/10 crash), we can switch using emergency multisig without having to go through 3h timelock))
*/
contract DualFallbackOracle is IAdapter {
    /// @notice HyperLend ACL Manager contract
    IACLManager public aclManager;

    /// @notice main price source, used most of the time
    IOracle public PRIMARY_SOURCE;
    /// @notice fallback price source, used if main is not available
    IOracle public FALLBACK_SOURCE;
    /// @notice price source which can be toggled by poolAdmin / emergencyAdmin / riskAdmin
    IOracle public EMERGENCY_SOURCE;

    /// @notice maximum allowed time since the last price update for primary oracle
    /// @dev if price update is older, fallback oracle will be used (if price there is not stale either)
    uint256 public MAX_HEARTBEAT_INTERVAL_PRIMARY;
    /// @notice maximum allowed time since the last price update for fallback oracle
    uint256 public MAX_HEARTBEAT_INTERVAL_FALLBACK;

    /// @notice the description of the price source
    string public description;
    /// @notice the number of decimals the aggregator responses represent
    uint8 public decimals;

    /// @notice idicates if emergency oracle is being used
    bool public isEmergencyOracleEnabled;
    
    /// @notice thrown if caller is not poolAdmin / emergencyAdmin / riskAdmin on HyperLend ACLManager
    error NotAdmin();
    /// @notice thrown when address(0) is used
    error InvalidAddress();
    /// @notice thrown when there decimals are missmatched between oracles
    error InvalidDecimals();
    /// @notice thrown if emergency oracle price is invalid
    error InvalidEmergencyOracleData();

    /// @notice emitted when emergency oracle use is toggled
    event SetEnableEmergencyOracle(bool isEnabled);

    /// @param _primarySource chainlink-compatible price oracle, used most of the time
    /// @param _fallbackSource chainlink-compatible price oracle, used when main is not available
    /// @param _emergencySource chainlink-compatible price oracle which can be toggled by risk admin
    /// @param _aclManager HyperLend ACL Manager contract
    /// @param _description the description of the price source
    /// @param _maxIntervalPrimary maximum allowed time since the last price update for primary oracle
    /// @param _maxIntervalFallback maximum allowed time since the last price update for fallback oracle
    constructor(
        address _primarySource, 
        address _fallbackSource, 
        address _emergencySource,
        address _aclManager,
        string memory _description, 
        uint256 _maxIntervalPrimary,
        uint256 _maxIntervalFallback
    ) {
        if (_primarySource == address(0)) revert InvalidAddress();
        if (_fallbackSource == address(0)) revert InvalidAddress();
        if (_aclManager == address(0)) revert InvalidAddress();

        PRIMARY_SOURCE = IOracle(_primarySource);
        FALLBACK_SOURCE = IOracle(_fallbackSource);
        EMERGENCY_SOURCE = IOracle(_emergencySource);

        MAX_HEARTBEAT_INTERVAL_PRIMARY = _maxIntervalPrimary;
        MAX_HEARTBEAT_INTERVAL_FALLBACK = _maxIntervalFallback;

        aclManager = IACLManager(_aclManager);
        description = _description;

        if (PRIMARY_SOURCE.decimals() != FALLBACK_SOURCE.decimals()) revert InvalidDecimals();
        if (address(EMERGENCY_SOURCE) != address(0) && PRIMARY_SOURCE.decimals() != EMERGENCY_SOURCE.decimals()) revert InvalidDecimals();
        decimals = PRIMARY_SOURCE.decimals();
    }

    /// @notice updates the emergency oracle use
    function setEnableEmergencyOracle(bool _isEnabled) external {
        if (!aclManager.isPoolAdmin(msg.sender) && !aclManager.isEmergencyAdmin(msg.sender) && !aclManager.isRiskAdmin(msg.sender)) revert NotAdmin();

        isEmergencyOracleEnabled = _isEnabled;

        emit SetEnableEmergencyOracle(_isEnabled);
    }

    /// @notice returns the latest price
    function latestAnswer() external view returns (int256) {
        ( , int256 answer , , , ) = getData();
        return answer;
    }

    /// @notice returns the latest price in chainlink-compatible format 
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ){  
        return getData();
    }

    function getData() internal view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        if (isEmergencyOracleEnabled && address(EMERGENCY_SOURCE) != address(0)){
            //if emergency latestRoundData, we want the tx to revert
            (
                uint80 _roundIdEmergency,
                int256 _answerEmergency,
                uint256 _startedAtEmergency,
                uint256 _updatedAtEmergency,
                uint80 _answeredInRoundEmergency
            ) = EMERGENCY_SOURCE.latestRoundData();

            if (_answerEmergency <= 0) revert InvalidEmergencyOracleData();

            return (_roundIdEmergency, _answerEmergency, _startedAtEmergency, _updatedAtEmergency, _answeredInRoundEmergency);
        }

        (
            bool _success,
            uint80 _roundId,
            int256 _answer,
            uint256 _startedAt,
            uint256 _updatedAt,
            uint80 _answeredInRound
        ) = _safeLatestRoundData(PRIMARY_SOURCE);

        //if primary isn't healthy, we first check if the fallback is also unhealthy
        //if both are unhealthy, we return primary prices
        //otherwise, we return fallback
        if (!_isPrimaryHealthy(_success, _answer, _updatedAt)){
            //we don't use _safeLatestRoundData here, since we want the tx to revert if both oracles revert
            (
                uint80 _roundIdFallback,
                int256 _answerFallback,
                uint256 _startedAtFallback,
                uint256 _updatedAtFallback,
                uint80 _answeredInRoundFallback
            ) = FALLBACK_SOURCE.latestRoundData();

            //if fallback is also unhealthy, but data is less stale than primary, return fallback data
            if (_isFallbackHealthy(_answerFallback, _updatedAtFallback) || _updatedAtFallback > _updatedAt){
                return (_roundIdFallback, _answerFallback, _startedAtFallback, _updatedAtFallback, _answeredInRoundFallback);
            }
        }

        //return round data from the main source
        roundId = _roundId;
        answer = _answer;
        startedAt = _startedAt;
        updatedAt = _updatedAt;
        answeredInRound = _answeredInRound;
    }

    /// @notice calls latestRoundData on source contract, without reverting the whole tx if the call reverts
    function _safeLatestRoundData(IOracle source) internal view returns (
        bool success, 
        uint80 r, 
        int256 a, 
        uint256 s, 
        uint256 u, 
        uint80 ar
    ){
        try source.latestRoundData() returns (
            uint80 _r,
            int256 _a,
            uint256 _s,
            uint256 _u,
            uint80 _ar
        ) {
            return (true, _r, _a, _s, _u, _ar);
        } catch {
            return (false, 0, 0, 0, 0, 0);
        }
    }

    function _isPrimaryHealthy(bool _success, int256 _answer, uint256 _updatedAt) internal view returns (bool){
        if (!_success) return false; 

        if (_answer <= 0){
            return false;
        }

        if (block.timestamp > _updatedAt + MAX_HEARTBEAT_INTERVAL_PRIMARY) {
            return false;
        }

        return true;
    }

    function _isFallbackHealthy(int256 _answer, uint256 _updatedAt) internal view returns (bool) {
        if (_answer <= 0){
            return false;
        }

        if (block.timestamp > _updatedAt + MAX_HEARTBEAT_INTERVAL_FALLBACK) {
            return false;
        }

        return true;
    }
}

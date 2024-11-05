# Setup Tests
1. Test constructor
   - [x] Should set the owner correctly
   - [x] Should initialize with correct SystemOracle address

## setAsset Tests
1. Adding new assets
   - [x] Only owner can add new assets
   - [x] Should correctly set asset details for perp-oracle assets
   - [x] Should correctly set asset details for non-perp-oracle assets
   - [x] Should emit AssetChanged event with correct parameters
   - [x] Should revert when trying to add an asset that already exists
   - [x] Should correctly set metaIndexes mapping

2. Updating existing assets
   - [x] Should correctly update existing perp-oracle asset details
   - [x] Should correctly update existing non-perp-oracle asset details
   - [x] Should emit AssetChanged event with isUpdate=true
   - [x] Should maintain existing metaIndexes mapping relationships

## toggleKeeper Tests
1. Basic functionality
   - [x] Only owner can toggle keepers
   - [x] Should correctly add new keeper
   - [x] Should correctly remove existing keeper
   - [x] Should emit KeeperUpdated event with correct parameters
   - [x] Should allow toggling keeper status multiple times

## submitRoundData Tests
1. Access Control
   - [x] Only keepers and owner can submit round data
   - [x] Should revert when called by non-keeper

2. Input Validation
   - [x] Should revert if arrays length mismatch
   - [x] Should revert if submit timestamp is too old
   - [x] Should revert if submit timestamp is in the future


3. EMA Calculation
   - [x] Should correctly calculate EMA for first price submission
   - [x] Should correctly calculate EMA for subsequent submissions
   - [x] Should handle different time intervals between submissions
   - [x] Should update lastTimestamp correctly
   - [x] Should emit RoundDataSubmitted event with correct parameters

4. Batch Processing
   - [x] Should process multiple assets in single transaction
   - [x] Should maintain correct EMA calculations across multiple submissions

## getPrice Tests
1. Basic Functionality
   - [x] Should revert for non-existent assets
   - Should return correct price for perp-oracle assets
   - [x] Should return correct EMA for non-perp-oracle assets

2. Perp-Oracle Assets
   - Should correctly scale prices based on metaDecimals
   - Should handle different decimal configurations
   - Should correctly read from SystemOracle
   - Should handle edge cases in SystemOracle data

3. Non-Perp-Oracle Assets
   - Should return latest EMA value
   - Should revert if EMA is stale (> MAX_EMA_STALE_SECONDS)
   - Should handle edge cases in EMA values

## getUpdateTimestamp Tests
1. Basic Functionality
   - Should revert for non-existent assets
   - Should return block.timestamp for perp-oracle assets
   - Should return lastTimestamp for non-perp-oracle assets

# Edge Cases and Security Tests
1. Boundary Conditions
   - Should handle zero prices
   - Should handle maximum possible prices
   - Should handle extreme time delays between updates
   - Should handle maximum possible metaIndex values

2. Security Considerations
   - Should maintain correct access control across all functions
   - Should handle potential overflow in EMA calculations
   - Should verify SystemOracle integration security
   - Should handle potential front-running scenarios
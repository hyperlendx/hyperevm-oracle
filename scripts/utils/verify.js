const path = require("path");
const fs = require("fs");

//   verify('0x4C7B17c8b4F3FF766889Aaf2ac5a6Db565FD61a9', [
//       '0x2F81b130ce13337f4eAc9e205E5eA710b492dbA4', '0x00038f83323b6b08116d1614cf33a9bd71ab5e0abf0c9f1b783a74a43e7bd992', 18, 'Chainlink-USDC/USD'
//   ])

async function verify(address, args, libraries){
    const params = {
        address: address,
        constructorArguments: args,
    }

    if (libraries){
        params.libraries = libraries
    }

    try {
        console.log(`verifying ${address} with args: ${args}`);
        await storeVerificationData(
            path.resolve(__dirname, `./verifications`),
            path.resolve(__dirname, `./verifications/${address}.json`),
            JSON.stringify(params, null, 4)
        );
        await hre.run("verify:verify", params);
    } catch (e) {
        console.log(`verification failed`);
        console.log(e.message);
    }
}

async function storeVerificationData(dir, filePath, data){
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, data);
}

module.exports.verify = verify;

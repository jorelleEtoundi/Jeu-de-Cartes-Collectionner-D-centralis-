const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script to verify the Andromeda Protocol contract on Etherscan
 * Usage: npx hardhat run scripts/verify.js --network sepolia
 */
async function main() {
  console.log("🔍 Starting contract verification...\n");

  // Load deployment info
  const deploymentPath = path.join(__dirname, "../deployments", `${network.name}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found!");
    console.error("   Please deploy the contract first using: npm run deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  console.log("📋 Deployment Information:");
  console.log("   Contract Address:", deploymentInfo.contractAddress);
  console.log("   Network:", deploymentInfo.network);
  console.log("   Deployer:", deploymentInfo.deployer);
  console.log("");

  // Constructor arguments
  const constructorArgs = [
    deploymentInfo.vrfCoordinator,
    deploymentInfo.linkToken,
    deploymentInfo.keyHash
  ];

  console.log("📝 Constructor Arguments:");
  console.log("   VRF Coordinator:", constructorArgs[0]);
  console.log("   LINK Token:", constructorArgs[1]);
  console.log("   Key Hash:", constructorArgs[2]);
  console.log("");

  try {
    console.log("⏳ Verifying contract on Etherscan...");
    
    await hre.run("verify:verify", {
      address: deploymentInfo.contractAddress,
      constructorArguments: constructorArgs
    });

    console.log("✅ Contract successfully verified on Etherscan!");
    console.log(`   View at: https://sepolia.etherscan.io/address/${deploymentInfo.contractAddress}`);
    
  } catch (error) {
    if (error.message.includes("already verified")) {
      console.log("ℹ️  Contract is already verified on Etherscan");
      console.log(`   View at: https://sepolia.etherscan.io/address/${deploymentInfo.contractAddress}`);
    } else {
      console.error("❌ Verification failed:", error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

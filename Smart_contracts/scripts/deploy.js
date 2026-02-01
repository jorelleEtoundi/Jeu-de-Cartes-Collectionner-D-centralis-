const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deployment script for Andromeda Protocol
 * Deploys to Sepolia testnet and verifies on Etherscan
 */
async function main() {
  console.log("🚀 Starting Andromeda Protocol Deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  const VRF_COORDINATOR = process.env.VRF_COORDINATOR || "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
  const LINK_TOKEN = process.env.LINK_TOKEN || "0x779877A7B0D9E8603169DdbD7836e478b4624789";
  const KEY_HASH = process.env.VRF_KEY_HASH || "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";

  console.log("🔗 Chainlink VRF Configuration:");
  console.log("   VRF Coordinator:", VRF_COORDINATOR);
  console.log("   LINK Token:", LINK_TOKEN);
  console.log("   Key Hash:", KEY_HASH);
  console.log("");

  console.log("📦 Deploying AndromedaProtocol contract...");
  
  const AndromedaProtocol = await ethers.getContractFactory("AndromedaProtocol");
  const andromeda = await AndromedaProtocol.deploy(
    VRF_COORDINATOR,
    LINK_TOKEN,
    KEY_HASH
  );

  await andromeda.waitForDeployment();
  const contractAddress = await andromeda.getAddress();

  console.log("✅ AndromedaProtocol deployed to:", contractAddress);
  console.log("");

  const deploymentInfo = {
    network: network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    vrfCoordinator: VRF_COORDINATOR,
    linkToken: LINK_TOKEN,
    keyHash: KEY_HASH,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to:", deploymentPath);
  console.log("");

  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/AndromedaProtocol.sol/AndromedaProtocol.json"
  );
  
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiDir = path.join(__dirname, "../abi");
    
    if (!fs.existsSync(abiDir)) {
      fs.mkdirSync(abiDir, { recursive: true });
    }
    
    const abiPath = path.join(abiDir, "AndromedaProtocol.json");
    fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
    
    console.log("📄 ABI exported to:", abiPath);
    console.log("");
  }

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await andromeda.deploymentTransaction().wait(6);
    console.log("✅ Block confirmations received");
    console.log("");

    console.log("🔍 Starting Etherscan verification...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          VRF_COORDINATOR,
          LINK_TOKEN,
          KEY_HASH
        ]
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      if (error.message.includes("already verified")) {
        console.log("ℹ️  Contract already verified on Etherscan");
      } else {
        console.error("❌ Verification failed:", error.message);
      }
    }
  }

  console.log("");
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("");
  console.log("📋 Summary:");
  console.log("   Contract Address:", contractAddress);
  console.log("   Network:", network.name);
  console.log("   Deployer:", deployer.address);
  console.log("");
  console.log("📝 Next Steps:");
  console.log("   1. Share contract address with frontend team (Arsel)");
  console.log("   2. Share ABI file with frontend team");
  console.log("   3. Fund contract with LINK tokens for VRF");
  console.log("   4. Coordinate with backend team (Emmanuel) for IPFS hashes");
  console.log("");
  console.log("💡 Fund with LINK:");
  console.log(`   Visit: https://faucets.chain.link/sepolia`);
  console.log(`   Contract: ${contractAddress}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

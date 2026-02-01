const fs = require("fs");
const path = require("path");

/**
 * Export ABI for frontend team
 * Usage: node scripts/export-abi.js
 */
async function main() {
  console.log("📦 Exporting ABI for frontend team...\n");

  const contractPath = path.join(
    __dirname,
    "../artifacts/contracts/AndromedaProtocol.sol/AndromedaProtocol.json"
  );

  if (!fs.existsSync(contractPath)) {
    console.error("❌ Contract artifact not found!");
    console.error("   Please compile the contract first using: npx hardhat compile");
    process.exit(1);
  }

  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));

  const abi = contract.abi;

  console.log("✅ ABI extracted successfully");
  console.log(`   Functions: ${abi.filter(item => item.type === "function").length}`);
  console.log(`   Events: ${abi.filter(item => item.type === "event").length}`);
  console.log("");

  // Create output directory
  const outputDir = path.join(__dirname, "../abi");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save ABI
  const outputPath = path.join(outputDir, "AndromedaProtocol.json");
  fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));

  console.log("💾 ABI saved to:", outputPath);
  console.log("");

  // Also create a TypeScript version
  const tsContent = `export const AndromedaProtocolABI = ${JSON.stringify(abi, null, 2)} as const;\n`;
  const tsOutputPath = path.join(outputDir, "AndromedaProtocol.ts");
  fs.writeFileSync(tsOutputPath, tsContent);

  console.log("💾 TypeScript ABI saved to:", tsOutputPath);
  console.log("");

  // Create a summary document
  const functions = abi.filter(item => item.type === "function" && item.stateMutability !== "view");
  const viewFunctions = abi.filter(item => item.type === "function" && item.stateMutability === "view");
  const events = abi.filter(item => item.type === "event");

  const summary = {
    contract: "AndromedaProtocol",
    exportedAt: new Date().toISOString(),
    statistics: {
      totalFunctions: functions.length + viewFunctions.length,
      writeFunctions: functions.length,
      readFunctions: viewFunctions.length,
      events: events.length
    },
    writeFunctions: functions.map(f => ({
      name: f.name,
      inputs: f.inputs.map(i => `${i.type} ${i.name}`)
    })),
    readFunctions: viewFunctions.map(f => ({
      name: f.name,
      inputs: f.inputs.map(i => `${i.type} ${i.name}`),
      outputs: f.outputs.map(o => o.type)
    })),
    events: events.map(e => ({
      name: e.name,
      inputs: e.inputs.map(i => `${i.type} ${i.name}`)
    }))
  };

  const summaryPath = path.join(outputDir, "contract-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log("📄 Contract summary saved to:", summaryPath);
  console.log("");

  console.log("=" .repeat(60));
  console.log("✅ ABI EXPORT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("");
  console.log("📝 Files to share with frontend team (Arsel):");
  console.log(`   1. ${outputPath}`);
  console.log(`   2. ${tsOutputPath}`);
  console.log(`   3. ${summaryPath}`);
  console.log("");
  console.log("💡 Next steps:");
  console.log("   1. Share these files with Arsel for frontend integration");
  console.log("   2. Provide contract address from deployments/sepolia.json");
  console.log("   3. Ensure contract is deployed and verified on Sepolia");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Export failed:", error);
    process.exit(1);
  });

import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("----------------------------------------------------");
  console.log("Deploying Stocklet Contract...");
  if (deployer) {
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Deployer address: ${deployer.address}`);
    console.log(`Deployer balance: ${ethers.formatEther(balance)} BOHR/ETH`);
  } else {
    console.log("Deployer address: Unknown");
  }
  console.log(`Network Name: ${network.name} (Chain ID: ${network.chainId})`);
  console.log("----------------------------------------------------");

  const Stocklet = await ethers.getContractFactory("Stocklet");
  const stocklet = await Stocklet.deploy();
  await stocklet.waitForDeployment();

  const deployedAddress = await stocklet.getAddress();
  console.log(`>>> Stocklet deployed successfully to: ${deployedAddress}`);

  // Update .env.local
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    let envContent = fs.readFileSync(envLocalPath, "utf8");
    envContent = envContent.replace(
      /NEXT_PUBLIC_STOCKLET_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_STOCKLET_CONTRACT_ADDRESS="${deployedAddress}"`
    );
    fs.writeFileSync(envLocalPath, envContent);
    console.log(">>> Updated NEXT_PUBLIC_STOCKLET_CONTRACT_ADDRESS in .env.local");
  }

  // Save the contract address and ABI to src directory for frontend usage
  const configDir = path.join(process.cwd(), "src", "config");
  const abiDir = path.join(process.cwd(), "src", "abi");

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Get compiled artifact
  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "Stocklet.sol",
    "Stocklet.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(
      path.join(abiDir, "Stocklet.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log(">>> Contract ABI saved to src/abi/Stocklet.json");
  }

  const deployedInfo = {
    address: deployedAddress,
    chainId: Number(network.chainId),
    network: network.name,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(configDir, "deployedContract.json"),
    JSON.stringify(deployedInfo, null, 2)
  );
  console.log(">>> Deployment info saved to src/config/deployedContract.json");
  console.log("----------------------------------------------------");

  // Attempt verification if on external network
  if (Number(network.chainId) !== 31337) {
    console.log("Waiting for block confirmations before verification...");
    const deployTx = stocklet.deploymentTransaction();
    if (deployTx) {
      await deployTx.wait(5);
    }

    console.log("Starting contract verification on BohrScan...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [],
      });
      console.log(">>> Contract verified successfully on BohrScan!");
    } catch (verifErr: any) {
      console.log(">>> Verification notice:", verifErr?.message || verifErr);
    }
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

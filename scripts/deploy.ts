import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const isMainnet = chainId === 677;

  console.log("----------------------------------------------------");
  console.log(`Deploying Stocklet Contract to BOT Chain (${network.name})...`);
  if (deployer) {
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Deployer address: ${deployer.address}`);
    console.log(`Deployer balance: ${ethers.formatEther(balance)} BOT`);
  } else {
    console.log("Deployer address: Unknown");
  }
  console.log(`Network Name: ${network.name} (Chain ID: ${chainId})`);

  // Query gas price to ensure minimal gas fees
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  console.log(`Current Gas Price: ${gasPrice ? ethers.formatUnits(gasPrice, "gwei") : "auto"} gwei`);

  const Stocklet = await ethers.getContractFactory("Stocklet");

  // Deploy with exact economical gas settings
  const deployOptions: any = {};
  if (gasPrice) {
    deployOptions.gasPrice = gasPrice;
  }

  console.log("Broadcasting deployment transaction...");
  const stocklet = await Stocklet.deploy(deployOptions);
  await stocklet.waitForDeployment();

  const deployedAddress = await stocklet.getAddress();
  const deployTx = stocklet.deploymentTransaction();
  const receipt = deployTx ? await deployTx.getTransaction() : null;
  console.log(`>>> Stocklet deployed successfully to: ${deployedAddress}`);

  // Update .env.local
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    let envContent = fs.readFileSync(envLocalPath, "utf8");
    envContent = envContent.replace(
      /NEXT_PUBLIC_STOCKLET_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_STOCKLET_CONTRACT_ADDRESS="${deployedAddress}"`
    );

    if (isMainnet) {
      envContent = envContent.replace(/NEXT_PUBLIC_CHAIN_ID=.*/, 'NEXT_PUBLIC_CHAIN_ID=677');
      envContent = envContent.replace(/NEXT_PUBLIC_CHAIN_NAME=.*/, 'NEXT_PUBLIC_CHAIN_NAME="Botchain Mainnet"');
      envContent = envContent.replace(/NEXT_PUBLIC_RPC_URL=.*/, 'NEXT_PUBLIC_RPC_URL="https://rpc.botchain.ai"');
      envContent = envContent.replace(/NEXT_PUBLIC_BLOCK_EXPLORER_URL=.*/, 'NEXT_PUBLIC_BLOCK_EXPLORER_URL="https://scan.botchain.ai"');
    }

    fs.writeFileSync(envLocalPath, envContent);
    console.log(">>> Updated environment variables in .env.local");
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

    console.log("Starting contract verification on scan.botchain.ai...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [],
      });
      console.log(">>> Contract verified successfully on scan.botchain.ai!");
    } catch (verifErr: any) {
      console.log(">>> Verification notice:", verifErr?.message || verifErr);
    }
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

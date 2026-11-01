import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const BOTCHAIN_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.bohr.life";
const rawKey = process.env.PRIVATE_KEY?.trim();
const normalizedKey = rawKey ? (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    botchain: {
      url: BOTCHAIN_RPC_URL,
      chainId: 968,
      accounts: normalizedKey ? [normalizedKey] : [],
    },
  },
  etherscan: {
    apiKey: {
      botchain: "empty",
    },
    customChains: [
      {
        network: "botchain",
        chainId: 968,
        urls: {
          apiURL: "https://scan.bohr.life/api",
          browserURL: "https://scan.bohr.life",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;


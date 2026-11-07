import { defineChain } from "viem";

export const botchain = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.botchain.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "BOT Chain Explorer",
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || "https://scan.botchain.ai",
    },
  },
  testnet: false,
});

export const hardhatLocalhost = defineChain({
  id: 31337,
  name: "Hardhat Localhost",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  testnet: true,
});

export const supportedChains = [botchain, hardhatLocalhost] as const;

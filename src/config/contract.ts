import { Address } from "viem";
import deployedInfo from "./deployedContract.json";

// Order of precedence:
// 1. Explicit env var NEXT_PUBLIC_STOCKLET_CONTRACT_ADDRESS (if not zero address)
// 2. deployedContract.json address
// 3. Fallback address
const envAddress = process.env.NEXT_PUBLIC_STOCKLET_CONTRACT_ADDRESS;
const hasValidEnvAddress =
  envAddress &&
  envAddress !== "0x0000000000000000000000000000000000000000" &&
  envAddress.startsWith("0x");

export const STOCKLET_CONTRACT_ADDRESS: Address = (
  hasValidEnvAddress
    ? envAddress
    : (deployedInfo as { address?: string })?.address || "0xF7ebF38f6406ea89c53799489c1e045a7766d79A"
) as Address;

export const STOCKLET_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "quantity", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "createdAt", type: "uint256" },
    ],
    name: "ProductAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "quantity", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "updatedAt", type: "uint256" },
    ],
    name: "ProductUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "uint256", name: "quantitySold", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "remainingQuantity", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "soldAt", type: "uint256" },
    ],
    name: "SaleRecorded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "uint256", name: "deletedAt", type: "uint256" },
    ],
    name: "ProductDeleted",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "addProduct",
    outputs: [{ internalType: "uint256", name: "productId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "productId", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "updateProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "productId", type: "uint256" },
      { internalType: "uint256", name: "quantitySold", type: "uint256" },
    ],
    name: "recordSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "productId", type: "uint256" }],
    name: "deleteProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyProducts",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "uint256", name: "quantity", type: "uint256" },
          { internalType: "uint256", name: "price", type: "uint256" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "totalSold", type: "uint256" },
        ],
        internalType: "struct Stocklet.Product[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "getProductCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "getOwnerStats",
    outputs: [
      { internalType: "uint256", name: "totalActiveProducts", type: "uint256" },
      { internalType: "uint256", name: "totalStockQuantity", type: "uint256" },
      { internalType: "uint256", name: "lowStockCount", type: "uint256" },
      { internalType: "uint256", name: "totalUnitsSold", type: "uint256" },
      { internalType: "uint256", name: "totalSalesTransactions", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "products",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "uint256", name: "totalSold", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "ownerSalesCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface RawProduct {
  id: bigint;
  name: string;
  quantity: bigint;
  price: bigint;
  owner: string;
  createdAt: bigint;
  isActive: boolean;
  totalSold: bigint;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  owner: string;
  createdAt: number;
  isActive: boolean;
  totalSold: number;
}

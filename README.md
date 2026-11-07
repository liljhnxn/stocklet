# Stocklet

> **Know what you have. Track what you sell.**

Stocklet is a lightweight, decentralized Web3 inventory management application tailored for small businesses. Business owners connect their MetaMask wallet to register products, manage available inventory, and atomically record sales directly on **Botchain Testnet** (Chain ID: 968) or a local development node.

---

## 🌟 Key Features

- **100% On-Chain Inventory Management**: No central database, server backend, or proprietary lock-in. All product additions, edits, deletions, and sale events are immutably logged on-chain.
- **Wallet-Isolated Catalogs**: Each business wallet manages only its own products (`getMyProducts()`, `getProductCount()`).
- **Real-Time Stock Decrement**: Records sales atomically with strict validation—preventing sales exceeding available inventory or recording zero units.
- **Visual Stock Health Indicators**:
  - 🟢 **Healthy Stock**: > 5 units available.
  - 🟡 **Low Stock**: 1 – 5 units available.
  - 🔴 **Out of Stock**: 0 units available.
- **Botchain Mainnet & Testnet Integration**: Preconfigured for Botchain Mainnet (Chain ID `677`, RPC `https://rpc.botchain.ai`, Explorer `https://scan.botchain.ai`, Token: `BOT`) and Botchain Testnet (Chain ID `968`).
- **Dark Charcoal Minimalist Design**: Custom palette with muted purple and emerald green accents, responsive across desktop and mobile screens.

---

## ⚙️ Blockchain Configuration

### Botchain Mainnet (Production)
| Parameter | Value |
| :--- | :--- |
| **Network** | Botchain Mainnet |
| **Chain ID** | `677` |
| **Currency Symbol** | `BOT` (150 Million Total Supply) |
| **RPC URL** | `https://rpc.botchain.ai` |
| **Block Explorer** | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **Mainnet Contract** | [`0xF7ebF38f6406ea89c53799489c1e045a7766d79A`](https://scan.botchain.ai/address/0xF7ebF38f6406ea89c53799489c1e045a7766d79A#code) |

### Botchain Testnet
| Parameter | Value |
| :--- | :--- |
| **Network** | Botchain Testnet |
| **Chain ID** | `968` |
| **Currency Symbol** | `BOHR` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |
| **Testnet Contract** | [`0x3d0c8231fACAff13de999E179B03e33ACaa7c2dC`](https://scan.bohr.life/address/0x3d0c8231fACAff13de999E179B03e33ACaa7c2dC#code) |

---

## 🔒 Important Business & Privacy Considerations

- **Public Blockchain Transparency**: All product details, pricing, quantities, and sales records are stored publicly and immutably on the blockchain. Anyone can inspect these records via the block explorer.
- **Confidentiality Notice**: Do not store sensitive trade secrets, internal customer names, personally identifiable information (PII), or private financial balances in product names or descriptions.
- **No Payment Processing / Custody**: Stocklet tracks inventory and unit sales; it deliberately avoids customer payments, custody of funds, and customer accounts for minimal surface area and maximum compliance.

---

## 🏗️ Architecture & Tech Stack

- **Smart Contract**: Solidity (`^0.8.20`) with Hardhat (`@nomicfoundation/hardhat-toolbox`)
- **Frontend Framework**: Next.js 14 (App Router) + TypeScript
- **Web3 Layer**: Wagmi v2 + Viem + TanStack React Query
- **Styling**: Tailwind CSS + Lucide React icons

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18+ or v20+
- **MetaMask** browser extension installed

### 2. Installation

Clone or open the workspace and install dependencies:

```bash
npm install
```

### 3. Compile & Test Smart Contract

Run the comprehensive unit test suite:

```bash
npm run test
```

Expected output:
```
  Stocklet Smart Contract
    Product Creation (addProduct)
      ✔ should allow a business owner to add a product
      ✔ should reject product with empty name
      ✔ should correctly increment product count for owner
    Product Updates (updateProduct)
      ✔ should allow owner to update product details
      ✔ should prevent non-owner from updating product
      ✔ should reject empty name on update
    Record Sales (recordSale)
      ✔ should allow owner to record sale and reduce stock
      ✔ should prevent recording sale of zero units
      ✔ should prevent sales exceeding available stock
      ✔ should prevent non-owner from recording sale
    Product Deletion (deleteProduct)
      ✔ should allow owner to delete product from active inventory
      ✔ should prevent non-owner from deleting product
      ✔ should prevent operations on deleted products
    Wallet Isolation & Owner Statistics
      ✔ should ensure each business wallet sees and manages only its own inventory
      ✔ should accurately return owner stats

  15 passing
```

---

## 📜 Smart Contract Deployment

### Option A: Deploy to Local Hardhat Network

1. Start a local Hardhat node in one terminal:
   ```bash
   npx hardhat node
   ```

2. Deploy the contract:
   ```bash
   npm run deploy:local
   ```

The script compiles the contract, deploys it, and automatically exports:
- Contract ABI to `src/abi/Stocklet.json`
- Deployment metadata to `src/config/deployedContract.json`

### Option B: Deploy to Botchain Testnet

1. Set your deployer private key in `.env.local`:
   ```env
   PRIVATE_KEY="your_private_key_here"
   NEXT_PUBLIC_RPC_URL="https://rpc.bohr.life"
   NEXT_PUBLIC_CHAIN_ID=968
   ```

2. Run the deployment script:
   ```bash
   npm run deploy:botchain
   ```

3. Update `.env.local` with the deployed address:
   ```env
   NEXT_PUBLIC_STOCKLET_CONTRACT_ADDRESS="0x..."
   ```

*(Alternatively, you can click the **Contract** pill in the top header within the running application to enter or change the contract address at runtime.)*

---

## 💻 Running the Web Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using the App:

1. **Connect Wallet**: Click **Connect Wallet** in the top-right corner to connect MetaMask.
2. **Switch Network**: If your wallet is on Ethereum or another network, click **Switch to Botchain** to switch to Chain ID `968`.
3. **Add Product**: Click **+ Add Product**, enter the product name, initial stock, and unit price, and confirm the transaction in MetaMask.
4. **Record Sale**: Click **Record Sale** on any product row. Enter the quantity sold (must not exceed available stock). The contract atomically decrements available inventory and increments sales.
5. **Edit / Delete**: Edit product name, stock, or price at any time, or click **Delete** to deactivate the product on-chain.
6. **Dashboard Stats**: View live metrics for Total Products, Total Stock Units, Low-Stock alerts, and Total Sales Recorded.

---

## 📁 Repository Structure

```
Stocklet/
├── contracts/
│   └── Stocklet.sol            # Core inventory smart contract
├── scripts/
│   └── deploy.ts               # Deployment script & ABI export helper
├── test/
│   └── Stocklet.test.ts        # Unit test suite (15 tests)
├── src/
│   ├── app/
│   │   ├── globals.css         # Charcoal theme & subtle glow effects
│   │   ├── layout.tsx          # Root Next.js layout & metadata
│   │   ├── page.tsx            # Main dashboard & wallet view
│   │   └── providers.tsx       # Wagmi & React Query providers
│   ├── components/
│   │   ├── Header.tsx          # Navbar, wallet button & contract config
│   │   ├── StatCard.tsx        # Dashboard metric cards
│   │   ├── InventoryTable.tsx  # Product table & search/filter controls
│   │   ├── AddProductModal.tsx # Product creation modal
│   │   ├── EditProductModal.tsx# Product edit modal
│   │   ├── RecordSaleModal.tsx # Sale decrement modal
│   │   ├── ProductDetailModal.tsx # Single product inspector modal
│   │   ├── PublicNoticeBanner.tsx # Blockchain transparency banner
│   │   └── NotificationToast.tsx  # Transaction status toast system
│   ├── config/
│   │   ├── chains.ts           # Botchain Testnet chain definition
│   │   ├── contract.ts         # Contract address & typed helpers
│   │   └── wagmi.ts            # Wagmi client configuration
│   └── abi/
│       └── Stocklet.json       # Generated contract ABI
├── hardhat.config.ts           # Hardhat config for Botchain & local
├── tailwind.config.ts          # Custom dark charcoal design tokens
├── package.json
└── README.md
```

---

## 📄 License

MIT License. Designed for small businesses and Web3 builders.


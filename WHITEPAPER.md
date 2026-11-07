# Stocklet: Decentralized Web3 Inventory Management
## Technical Whitepaper & Pitch Deck Overview
**Tagline:** *Know what you have. Track what you sell.*

**Version:** 1.1.0  
**Date:** November 2026  
**Network:** BOT Chain (Chain ID: `677`)  
**Native Currency:** `BOT` (150 Million Total Supply)  
**Contract Address:** `0xF7ebF38f6406ea89c53799489c1e045a7766d79A`  
**BOT Chain Website:** [https://botchain.ai](https://botchain.ai)  
**BOT Chain Explorer:** [https://scan.botchain.ai](https://scan.botchain.ai)  
**Verified Contract on Explorer:** [https://scan.botchain.ai/address/0xF7ebF38f6406ea89c53799489c1e045a7766d79A#code](https://scan.botchain.ai/address/0xF7ebF38f6406ea89c53799489c1e045a7766d79A#code)  
**Repository:** [https://github.com/liljhnxn/stocklet](https://github.com/liljhnxn/stocklet)  

---

## Part 1: Executive Whitepaper

### 1. Abstract
Small businesses worldwide face an ongoing dilemma: traditional inventory management software is plagued by bloated subscription fees, vendor lock-in, centralized database outages, and complex onboarding. Conversely, manual spreadsheets are error-prone and fail to synchronize reliably. 

**Stocklet** introduces a lean, decentralized alternative built natively on **BOT Chain**. By utilizing the EVM-compatible BOT Chain architecture, Stocklet allows business owners to connect their self-custodial Web3 wallet (e.g., MetaMask), register product catalogs, update quantities, and atomically record sales with automatic stock deduction. Stocklet operates entirely without a centralized database, API server, or middleman custody, ensuring high availability, verifiable accounting, and total business independence.

---

### 2. The Problem
1. **High Overhead & Recurring SaaS Subscriptions**: Small and independent merchants frequently spend \$30–\$150/month on complex ERP systems loaded with enterprise features they never touch.
2. **Platform Risk & Data Lock-In**: Centralized cloud inventory systems control merchant data. Server downtime, policy shifts, or account suspensions directly halt retail operations.
3. **Synchronization Errors & Overselling**: Disjointed point-of-sale and tracking spreadsheets lead to stock overdraws, inaccurate inventory figures, and unfulfilled orders.
4. **Complex Onboarding**: Standard tools require email registration, password management, payment authorizations, and multi-step configurations before a single item can be logged.

---

### 3. The Stocklet Solution
Stocklet reimagines inventory management as a streamlined, utility-first decentralized application:
* **Zero Backend / Serverless**: No SQL/NoSQL databases, user accounts, or proprietary APIs. The blockchain serves as the single source of truth.
* **Wallet-Isolated Tenancy**: A merchant's wallet address serves as their business identity. Cryptographic authentication via MetaMask guarantees that only the product owner can modify prices, update quantities, record sales, or archive items.
* **Deterministic Stock Control**: Stock decrements are executed atomically on-chain. Smart contract logic prevents negative inventory, overselling, and invalid inputs before execution.
* **Real-Time Health Monitoring**: Dynamic visual status indicators (🟢 Healthy, 🟡 Low Stock [≤5 units], 🔴 Out of Stock) provide instant situational awareness.
* **Permanent, Public Verifiability**: Immutable event streams (`ProductAdded`, `ProductUpdated`, `SaleRecorded`, `ProductDeleted`) give merchants a transparent audit trail of their business activity.

---

### 4. Technical Architecture

```
[ Business Owner ] ──( MetaMask / Web3 Provider )
         │
         ▼
[ Next.js 14 Frontend (App Router, Tailwind CSS, Wagmi v2, Viem) ]
         │ (RPC over HTTPS - https://rpc.botchain.ai)
         ▼
[ BOT Chain (Chain ID: 677) ]
         │
         ▼
[ Stocklet.sol Smart Contract (Paris EVM, Solidity 0.8.20) ]
  ├── Product Struct (ID, Name, Quantity, Price, Owner, Timestamp, Active, TotalSold)
  ├── State Mappings (products, ownerProductIds, ownerSalesCount)
  └── Guard Modifiers (onlyProductOwner, productMustExistAndBeActive)
```

#### Smart Contract Specification
The `Stocklet` smart contract (`Stocklet.sol`) is engineered with gas economy, strict access control, and integer arithmetic:

- `addProduct(string name, uint256 quantity, uint256 price)`: Validates name length (1-100 chars), assigns an auto-incrementing ID, records timestamp, and pushes ID to the sender's inventory array.
- `updateProduct(uint256 productId, string name, uint256 quantity, uint256 price)`: Enables the owner to update product attributes while preserving audit history.
- `recordSale(uint256 productId, uint256 quantitySold)`: Atomically verifies that `quantitySold > 0` and `quantitySold <= currentStock`, reduces available inventory, increases `totalSold`, and increments total business sales transactions.
- `deleteProduct(uint256 productId)`: Soft-deletes a product from active inventory while maintaining historical integrity on-chain.
- `getMyProducts()`: Reads and returns all products registered to `msg.sender`.
- `getProductCount(address owner)`: Returns the total number of products owned by an address.
- `getOwnerStats(address owner)`: High-efficiency view function calculating total active products, total stock units, low-stock count, and cumulative units sold in a single zero-gas RPC call.

---

### 5. Blockchain Integration (BOT Chain)

| Parameter | Value |
| :--- | :--- |
| **Network Name** | BOT Chain |
| **Chain ID** | `677` |
| **Native Currency** | `BOT` (150 Million Total Supply) |
| **RPC Endpoint** | `https://rpc.botchain.ai` |
| **Official Website** | [https://botchain.ai](https://botchain.ai) |
| **Block Explorer** | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **Deployed Contract** | `0xF7ebF38f6406ea89c53799489c1e045a7766d79A` |
| **Verification Status** | Fully Verified with Solidity `0.8.20` on BOT Chain Explorer |

---

### 6. Privacy & Security Considerations
* **Public Transparency**: All transactions and inventory balances recorded on-chain are publicly verifiable. Merchants are explicitly advised not to store customer personally identifiable information (PII) or confidential secrets within product labels.
* **Non-Custodial**: Stocklet holds no merchant funds and does not facilitate fiat/token payment processing, drastically reducing attack surfaces and regulatory friction.
* **Role Verification**: State changes are strictly enforced at the smart contract level using `require(products[productId].owner == msg.sender)` modifiers.

---

## Part 2: Investor & Ecosystem Pitch Deck

```
================================================================================
SLIDE 1: TITLE SLIDE
================================================================================
STOCKLET
Know what you have. Track what you sell.

A lightweight, serverless Web3 inventory & sales tracker for small businesses.
Built natively on BOT Chain (Chain ID: 677).

Website / Demo: http://localhost:3000
BOT Chain Website: https://botchain.ai
BOT Chain Explorer: https://scan.botchain.ai
Verified Contract: https://scan.botchain.ai/address/0xF7ebF38f6406ea89c53799489c1e045a7766d79A#code
GitHub: https://github.com/liljhnxn/stocklet

================================================================================
SLIDE 2: THE PROBLEM
================================================================================
Small businesses are trapped between two extremes:

1. Enterprise SaaS Bloat:
   - $50 - $200/month recurring fees for features small merchants never use.
   - Centralized server downtime halts physical sales.
   - High churn and vendor lock-in.

2. Fragile Spreadsheets:
   - High error rate, no atomic concurrency, frequent overselling.
   - Zero auditability or immutable history.

================================================================================
SLIDE 3: THE SOLUTION
================================================================================
Stocklet: Decentralized Inventory Infrastructure

- Connect with MetaMask: Instant onboarding in seconds.
- 100% On-Chain Inventory: No database to hack, crash, or migrate.
- Isolated Business Catalogs: Every wallet owns and controls its catalog.
- Atomic Stock Decrements: Instant sales deduction, preventing stockouts.
- Minimalist Dark Charcoal Dashboard: Fast, responsive desktop & mobile UX.

================================================================================
SLIDE 4: PRODUCT WALKTHROUGH
================================================================================
1. Live Metric Cards:
   - Total Products, Total Stock Units, Low-Stock Alerts, Total Sales.
2. Product Catalog & Status Filter:
   - Healthy (>5 units) | Low Stock (<=5 units) | Out of Stock (0 units).
3. Instant Sale Recording:
   - Real-time stock calculation, max button, and atomic on-chain execution.
4. Comprehensive Product Inspector:
   - Timestamp, units sold, owner address, and direct BOT Chain Explorer links.

================================================================================
SLIDE 5: UNDER THE HOOD
================================================================================
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Web3 Stack: Wagmi v2 + Viem + TanStack React Query
- Smart Contract: Solidity 0.8.20 + Hardhat Toolbox
- Blockchain: BOT Chain (Chain ID: 677, Token: BOT, ultra-low fees, fast block times)
- Tested & Audited: 15 comprehensive unit tests covering all edge cases.

================================================================================
SLIDE 6: COMPETITIVE ADVANTAGE
================================================================================
Feature               | Traditional SaaS (Shopify/Square) | Spreadsheets | Stocklet
----------------------|-----------------------------------|--------------|----------
Monthly Fee           | $39 - $299/mo                     | Free         | Zero SaaS Fee
Backend Dependency    | Centralized Cloud                 | Local File   | BOT Chain (100% Uptime)
Atomic Oversell Guard | Partial                           | None         | Guaranteed by Contract
Onboarding Time       | 30+ Minutes                       | 10 Minutes   | 5 Seconds (MetaMask)
Data Ownership        | Platform Owned                    | Device Only  | Wallet Self-Custodial

================================================================================
SLIDE 7: ROADMAP
================================================================================
- Phase 1 (Delivered):
  ✓ Core Solidity contract deployed & verified on BOT Chain.
  ✓ Next.js dashboard with inventory creation, sales deduction & analytics.
  ✓ 15 unit tests passing with full test coverage.

- Phase 2 (Near-Term):
  - Multi-location warehouse support per wallet.
  - Exportable on-chain CSV accounting reports.
  - Barcode / QR code mobile scanning integration.

- Phase 3 (Ecosystem Scale):
  - Optional Web3 invoice generation and micro-receipt minting.
  - Decentralized supplier re-order notifications.

================================================================================
SLIDE 8: SUMMARY & LINKS
================================================================================
Stocklet brings the sovereignty and reliability of Web3 to everyday merchants.

- BOT Chain Website:
  https://botchain.ai
- BOT Chain Explorer:
  https://scan.botchain.ai
- Verified Contract on BOT Chain Explorer:
  https://scan.botchain.ai/address/0xF7ebF38f6406ea89c53799489c1e045a7766d79A#code
- GitHub Repository:
  https://github.com/liljhnxn/stocklet
- Network: BOT Chain (Chain ID: 677)

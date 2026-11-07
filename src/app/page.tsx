"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnect,
} from "wagmi";
import {
  Package,
  Layers,
  AlertTriangle,
  TrendingDown,
  Plus,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Zap,
  Lock,
} from "lucide-react";
import { Header } from "../components/Header";
import { PublicNoticeBanner } from "../components/PublicNoticeBanner";
import { StatCard } from "../components/StatCard";
import { InventoryTable } from "../components/InventoryTable";
import { AddProductModal } from "../components/AddProductModal";
import { EditProductModal } from "../components/EditProductModal";
import { RecordSaleModal } from "../components/RecordSaleModal";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { NotificationToast, ToastMessage } from "../components/NotificationToast";
import {
  STOCKLET_CONTRACT_ADDRESS,
  STOCKLET_ABI,
  InventoryItem,
  RawProduct,
} from "../config/contract";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const chainId = useChainId();
  const explorerUrl = "https://scan.botchain.ai";

  // Lock strictly to Mainnet verified contract address
  const contractAddress = STOCKLET_CONTRACT_ADDRESS;

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear out any old cached testnet addresses from local storage
      localStorage.removeItem("stocklet_custom_address");
    }
  }, []);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProductForSale, setSelectedProductForSale] = useState<InventoryItem | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<InventoryItem | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<InventoryItem | null>(null);

  // Notifications / Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    if (toast.type !== "loading") {
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    }
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Wagmi Write Contract Hook
  const {
    data: txHash,
    writeContractAsync,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for Tx Confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Track pending transaction toast ID
  const [pendingToastId, setPendingToastId] = useState<string | null>(null);

  // Read smart contract: getMyProducts
  const {
    data: rawProducts,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: STOCKLET_ABI,
    functionName: "getMyProducts",
    account: address,
    query: {
      enabled: isConnected && !!address && contractAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Read smart contract: getOwnerStats
  const {
    data: rawStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: STOCKLET_ABI,
    functionName: "getOwnerStats",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && contractAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Format products from BigInt to number
  const products: InventoryItem[] = React.useMemo(() => {
    if (!rawProducts || !Array.isArray(rawProducts)) return [];
    return (rawProducts as RawProduct[]).map((p) => ({
      id: Number(p.id),
      name: p.name,
      quantity: Number(p.quantity),
      price: Number(p.price),
      owner: p.owner,
      createdAt: Number(p.createdAt),
      isActive: p.isActive,
      totalSold: Number(p.totalSold || BigInt(0)),
    }));
  }, [rawProducts]);

  // Statistics calculation (fallback to client computation if getOwnerStats not available)
  const activeProducts = products.filter((p) => p.isActive);
  const typedStats = rawStats as [bigint, bigint, bigint, bigint, bigint] | undefined;
  const totalProducts = typedStats ? Number(typedStats[0]) : activeProducts.length;
  const totalStockQuantity = typedStats ? Number(typedStats[1]) : activeProducts.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockCount = typedStats ? Number(typedStats[2]) : activeProducts.filter((p) => p.quantity <= 5).length;
  const totalSalesRecorded = typedStats ? Number(typedStats[3]) : activeProducts.reduce((acc, p) => acc + p.totalSold, 0);

  // Watch transaction status changes
  useEffect(() => {
    if (isConfirming && pendingToastId) {
      // Still confirming
    } else if (isConfirmed && pendingToastId) {
      removeToast(pendingToastId);
      setPendingToastId(null);
      addToast({
        type: "success",
        title: "Transaction Confirmed!",
        message: "Your on-chain inventory has been updated.",
        txHash,
      });
      refetchProducts();
      refetchStats();
      resetWrite();
    } else if (confirmError && pendingToastId) {
      removeToast(pendingToastId);
      setPendingToastId(null);
      addToast({
        type: "error",
        title: "Transaction Failed",
        message: confirmError.message || "Execution reverted on BOT Chain.",
      });
      resetWrite();
    }
  }, [isConfirming, isConfirmed, confirmError, pendingToastId, txHash, refetchProducts, refetchStats, resetWrite]);

  // Actions
  const handleAddProduct = async (name: string, quantity: number, price: number) => {
    try {
      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: STOCKLET_ABI,
        functionName: "addProduct",
        args: [name, BigInt(quantity), BigInt(price)],
      });

      const tId = addToast({
        type: "loading",
        title: "Adding Product...",
        message: "Submitting transaction to BOT Chain.",
        txHash: hash,
      });
      setPendingToastId(tId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to add product";
      addToast({
        type: "error",
        title: "Failed to Add Product",
        message: errorMsg,
      });
      throw err;
    }
  };

  const handleUpdateProduct = async (
    productId: number,
    name: string,
    quantity: number,
    price: number
  ) => {
    try {
      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: STOCKLET_ABI,
        functionName: "updateProduct",
        args: [BigInt(productId), name, BigInt(quantity), BigInt(price)],
      });

      const tId = addToast({
        type: "loading",
        title: "Updating Product...",
        message: "Submitting product changes to BOT Chain.",
        txHash: hash,
      });
      setPendingToastId(tId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update product";
      addToast({
        type: "error",
        title: "Update Failed",
        message: errorMsg,
      });
      throw err;
    }
  };

  const handleRecordSale = async (productId: number, quantitySold: number) => {
    try {
      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: STOCKLET_ABI,
        functionName: "recordSale",
        args: [BigInt(productId), BigInt(quantitySold)],
      });

      const tId = addToast({
        type: "loading",
        title: "Recording Sale...",
        message: `Deducting ${quantitySold} unit(s) on BOT Chain.`,
        txHash: hash,
      });
      setPendingToastId(tId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to record sale";
      addToast({
        type: "error",
        title: "Sale Failed",
        message: errorMsg,
      });
      throw err;
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: STOCKLET_ABI,
        functionName: "deleteProduct",
        args: [BigInt(productId)],
      });

      const tId = addToast({
        type: "loading",
        title: "Deleting Product...",
        message: "Deactivating product from active inventory on-chain.",
        txHash: hash,
      });
      setPendingToastId(tId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete product";
      addToast({
        type: "error",
        title: "Delete Failed",
        message: errorMsg,
      });
    }
  };

  const isActionPending = isWritePending || isConfirming;

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950 font-sans selection:bg-brand-purple selection:text-white">
      {/* Header */}
      <Header />

      {/* Notice Banner */}
      <PublicNoticeBanner />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!isConnected ? (
          /* Disconnected State View */
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-brand-purple to-brand-green flex items-center justify-center shadow-2xl shadow-brand-purple/20 ring-1 ring-white/15">
                <Package className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-brand-green shadow-md">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Know what you have. Track what you sell.
            </h1>
            <p className="mt-3 text-base text-charcoal-400 max-w-xl leading-relaxed">
              Stocklet is a clean, lightweight decentralized inventory manager for small businesses.
              Connect your MetaMask wallet to manage your stock directly on BOT Chain.
            </p>

            {/* Connect CTA Button */}
            <div className="mt-8">
              <button
                onClick={() => {
                  const connector = connectors[0];
                  if (connector) connect({ connector });
                }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-purple text-white font-semibold text-base transition-all shadow-xl shadow-brand-purple/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Wallet className="h-5 w-5" />
                <span>Connect MetaMask to Start</span>
              </button>
            </div>

            {/* Features Highlight */}
            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left">
              <div className="rounded-2xl bg-charcoal-900/60 border border-charcoal-800 p-6 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-xl bg-brand-purple/15 text-brand-purple border border-brand-purple/20 flex items-center justify-center mb-4">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="text-base font-semibold text-white">
                  Isolated Business Wallets
                </h4>
                <p className="text-xs text-charcoal-400 mt-1.5 leading-relaxed">
                  Each business wallet manages its own inventory on-chain. Only your wallet can modify your products.
                </p>
              </div>

              <div className="rounded-2xl bg-charcoal-900/60 border border-charcoal-800 p-6 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-xl bg-brand-green/15 text-brand-green border border-brand-green/20 flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="text-base font-semibold text-white">
                  Real-Time Stock Updates
                </h4>
                <p className="text-xs text-charcoal-400 mt-1.5 leading-relaxed">
                  Record sales with automatic stock deduction and verification directly via the smart contract.
                </p>
              </div>

              <div className="rounded-2xl bg-charcoal-900/60 border border-charcoal-800 p-6 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h4 className="text-base font-semibold text-white">
                  BOT Chain (Chain ID: 677)
                </h4>
                <p className="text-xs text-charcoal-400 mt-1.5 leading-relaxed">
                  Lightweight, gas-conscious Solidity architecture with zero backend server dependencies.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Connected State: Business Owner Dashboard */
          <>
            {/* Dashboard Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Products"
                value={totalProducts}
                subtitle="Active products in catalog"
                icon={Package}
                variant="purple"
              />
              <StatCard
                title="Total Stock Units"
                value={totalStockQuantity}
                subtitle="Available inventory items"
                icon={Layers}
                variant="default"
              />
              <StatCard
                title="Low-Stock Alerts"
                value={lowStockCount}
                subtitle="5 or fewer units left"
                icon={AlertTriangle}
                variant="yellow"
              />
              <StatCard
                title="Total Sales Recorded"
                value={totalSalesRecorded}
                subtitle="Units sold on-chain"
                icon={TrendingDown}
                variant="green"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Inventory Catalog
                </h2>
                <p className="text-xs text-charcoal-400 mt-0.5">
                  Manage, track, and record sales for products registered under your wallet.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Manual Refetch Button */}
                <button
                  onClick={() => {
                    refetchProducts();
                    refetchStats();
                  }}
                  disabled={isProductsLoading || isStatsLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-charcoal-300 hover:text-white border border-charcoal-750 text-xs font-medium transition-colors disabled:opacity-50"
                  title="Refresh from blockchain"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      isProductsLoading || isStatsLoading ? "animate-spin" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {/* Add Product Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  disabled={isActionPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-purple text-white text-xs font-semibold shadow-md shadow-brand-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <InventoryTable
              products={products}
              isLoading={isProductsLoading}
              onOpenSaleModal={(product) => setSelectedProductForSale(product)}
              onOpenEditModal={(product) => setSelectedProductForEdit(product)}
              onOpenDetailModal={(product) => setSelectedProductForDetail(product)}
              onDeleteProduct={handleDeleteProduct}
              isActionPending={isActionPending}
            />
          </>
        )}

        {/* BOT Chain Ecosystem Showcase Section */}
        <section className="rounded-2xl bg-charcoal-900/80 border border-charcoal-800 p-6 sm:p-8 mt-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-black border border-charcoal-700/80 p-2 flex items-center justify-center shadow-xl shadow-brand-green/10 flex-shrink-0">
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="h-full w-full object-contain rounded-xl"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Powered by BOT Chain
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-green/15 text-brand-green border border-brand-green/30">
                    Chain ID 677
                  </span>
                </div>
                <p className="text-xs text-charcoal-400 mt-1 max-w-xl">
                  Decentralized, high-throughput smart contract platform powered by the BOT native token (150 Million supply). Stocklet utilizes BOT Chain for low-latency, gas-conscious inventory state transitions.
                </p>
              </div>
            </div>

            {/* Required Ecosystem Links with Logo in Front */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-white border border-charcoal-700 text-xs font-medium transition-all shadow-sm hover:border-brand-purple/40 group"
              >
                <img src="/botchain-logo.png" alt="BOT Chain" className="h-4 w-4 rounded-sm object-cover" />
                <span>BOT Chain Website</span>
                <span className="text-charcoal-400 text-[11px] font-mono">botchain.ai</span>
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-white border border-charcoal-700 text-xs font-medium transition-all shadow-sm hover:border-brand-green/40 group"
              >
                <img src="/botchain-logo.png" alt="BOT Chain" className="h-4 w-4 rounded-sm object-cover" />
                <span>BOT Chain Explorer</span>
                <span className="text-charcoal-400 text-[11px] font-mono">scan.botchain.ai</span>
              </a>

              <a
                href="https://scan.botchain.ai/address/0xF7ebF38f6406ea89c53799489c1e045a7766d79A#code"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-purple/15 hover:bg-brand-purple/25 text-brand-purple-light border border-brand-purple/30 text-xs font-medium transition-all shadow-sm"
              >
                <img src="/botchain-logo.png" alt="BOT Chain" className="h-4 w-4 rounded-sm object-cover" />
                <span>Verified Mainnet Contract</span>
                <span className="font-mono text-[11px]">0xF7eb...d79A</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with BOT Chain branding and both official links with logo in front */}
      <footer className="border-t border-charcoal-850 py-8 bg-charcoal-900/60 text-xs text-charcoal-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/botchain-logo.png" alt="BOT Chain" className="h-6 w-6 rounded-md object-cover" />
            <span className="font-semibold text-white">Stocklet</span>
            <span className="text-charcoal-600">•</span>
            <span className="text-charcoal-400">Know what you have. Track what you sell.</span>
          </div>

          {/* Official Required Links with Logo in Front */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal-300 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <img src="/botchain-logo.png" alt="BOT Chain Logo" className="h-4 w-4 rounded-sm object-cover" />
              <span>BOT Chain Website: <strong className="text-white group-hover:underline">https://botchain.ai</strong></span>
            </a>

            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal-300 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <img src="/botchain-logo.png" alt="BOT Chain Explorer Logo" className="h-4 w-4 rounded-sm object-cover" />
              <span>BOT Chain Explorer: <strong className="text-white group-hover:underline">https://scan.botchain.ai</strong></span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
        isPending={isActionPending}
      />

      <EditProductModal
        product={selectedProductForEdit}
        isOpen={!!selectedProductForEdit}
        onClose={() => setSelectedProductForEdit(null)}
        onUpdateProduct={handleUpdateProduct}
        isPending={isActionPending}
      />

      <RecordSaleModal
        product={selectedProductForSale}
        isOpen={!!selectedProductForSale}
        onClose={() => setSelectedProductForSale(null)}
        onRecordSale={handleRecordSale}
        isPending={isActionPending}
      />

      <ProductDetailModal
        product={selectedProductForDetail}
        isOpen={!!selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onOpenSaleModal={(p) => setSelectedProductForSale(p)}
        onOpenEditModal={(p) => setSelectedProductForEdit(p)}
      />

      {/* Global Notification Toast */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

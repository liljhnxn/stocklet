"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ShoppingBag,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  PackageOpen,
  Filter,
} from "lucide-react";
import { InventoryItem } from "../config/contract";

interface InventoryTableProps {
  products: InventoryItem[];
  isLoading: boolean;
  onOpenSaleModal: (product: InventoryItem) => void;
  onOpenEditModal: (product: InventoryItem) => void;
  onOpenDetailModal: (product: InventoryItem) => void;
  onDeleteProduct: (productId: number) => Promise<void>;
  isActionPending: boolean;
}

export function InventoryTable({
  products,
  isLoading,
  onOpenSaleModal,
  onOpenEditModal,
  onOpenDetailModal,
  onDeleteProduct,
  isActionPending,
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "healthy" | "low" | "out">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filter active products only
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.isActive);
  }, [products]);

  // Filter and search
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filterStatus === "healthy") return product.quantity > 5;
      if (filterStatus === "low") return product.quantity > 0 && product.quantity <= 5;
      if (filterStatus === "out") return product.quantity === 0;

      return true;
    });
  }, [activeProducts, searchTerm, filterStatus]);

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          Out of Stock
        </span>
      );
    }
    if (quantity <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Low Stock ({quantity})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-green/15 text-brand-green border border-brand-green/30">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
        Healthy ({quantity})
      </span>
    );
  };

  const confirmDelete = async (productId: number) => {
    if (window.confirm("Are you sure you want to remove this product from active inventory on-chain?")) {
      setDeletingId(productId);
      try {
        await onDeleteProduct(productId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-xl overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-2 bg-charcoal-950 border border-charcoal-750 rounded-xl text-sm text-white placeholder:text-charcoal-500 focus:outline-none focus:border-brand-purple transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-charcoal-500 mr-1 hidden md:block" />
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-brand-purple text-white shadow-sm shadow-brand-purple/20"
                : "bg-charcoal-800 text-charcoal-400 hover:text-white"
            }`}
          >
            All ({activeProducts.length})
          </button>
          <button
            onClick={() => setFilterStatus("healthy")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === "healthy"
                ? "bg-brand-green text-white shadow-sm shadow-brand-green/20"
                : "bg-charcoal-800 text-charcoal-400 hover:text-white"
            }`}
          >
            Healthy
          </button>
          <button
            onClick={() => setFilterStatus("low")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === "low"
                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                : "bg-charcoal-800 text-charcoal-400 hover:text-white"
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilterStatus("out")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === "out"
                ? "bg-red-500 text-white shadow-sm shadow-red-500/20"
                : "bg-charcoal-800 text-charcoal-400 hover:text-white"
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 rounded-full border-2 border-brand-purple border-t-transparent animate-spin mb-3" />
          <p className="text-sm text-charcoal-300">Fetching inventory from Botchain Testnet...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-charcoal-800/80 border border-charcoal-700/60 flex items-center justify-center text-charcoal-500 mb-4">
            <PackageOpen className="h-7 w-7" />
          </div>
          <h4 className="text-base font-semibold text-white">
            {searchTerm || filterStatus !== "all"
              ? "No matching products found"
              : "No products in your inventory"}
          </h4>
          <p className="text-xs text-charcoal-400 max-w-sm mt-1.5">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search terms or filters."
              : "Use the 'Add Product' button above to register your first item on-chain."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-charcoal-800 bg-charcoal-950/40 text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Available Stock</th>
                  <th className="py-3.5 px-6">Unit Price</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800/60">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-charcoal-850/60 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-charcoal-300 font-mono text-xs font-bold">
                          #{product.id}
                        </div>
                        <div>
                          <p className="font-semibold text-white tracking-tight group-hover:text-brand-purple transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-charcoal-500 font-mono">
                            Sold: {product.totalSold || 0} units
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono font-medium text-white text-base">
                        {product.quantity}
                      </span>
                      <span className="text-xs text-charcoal-500 ml-1">units</span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono font-medium text-brand-purple text-base">
                        {product.price}
                      </span>
                      <span className="text-xs text-charcoal-500 ml-1">units</span>
                    </td>

                    <td className="py-4 px-6">
                      {getStockBadge(product.quantity)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Record Sale Button */}
                        <button
                          onClick={() => onOpenSaleModal(product)}
                          disabled={isActionPending || product.quantity === 0}
                          title="Record Sale"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20 text-xs font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Record Sale</span>
                        </button>

                        {/* View Details */}
                        <button
                          onClick={() => onOpenDetailModal(product)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-400 hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onOpenEditModal(product)}
                          disabled={isActionPending}
                          title="Edit Product"
                          className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-400 hover:text-white transition-colors disabled:opacity-40"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => confirmDelete(product.id)}
                          disabled={isActionPending || deletingId === product.id}
                          title="Delete Product"
                          className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-red-500/15 text-charcoal-400 hover:text-red-400 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-charcoal-800/80">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-charcoal-500 uppercase">
                      ID #{product.id}
                    </span>
                    <h5 className="font-semibold text-white text-base">
                      {product.name}
                    </h5>
                  </div>
                  {getStockBadge(product.quantity)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-charcoal-950 p-2.5 rounded-xl border border-charcoal-800/70">
                  <div>
                    <span className="text-charcoal-500 block text-[11px]">Stock:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {product.quantity} units
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal-500 block text-[11px]">Unit Price:</span>
                    <span className="font-mono font-bold text-brand-purple text-sm">
                      {product.price} units
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => onOpenSaleModal(product)}
                    disabled={isActionPending || product.quantity === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-green/15 text-brand-green border border-brand-green/30 text-xs font-semibold hover:bg-brand-green/25 transition-colors disabled:opacity-30"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Record Sale</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenDetailModal(product)}
                      className="p-2 rounded-xl bg-charcoal-800 text-charcoal-300 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOpenEditModal(product)}
                      className="p-2 rounded-xl bg-charcoal-800 text-charcoal-300 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(product.id)}
                      className="p-2 rounded-xl bg-charcoal-800 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


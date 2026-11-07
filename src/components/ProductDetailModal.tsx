"use client";

import React from "react";
import { X, Package, Calendar, User, ExternalLink } from "lucide-react";
import { InventoryItem } from "../config/contract";

interface ProductDetailModalProps {
  product: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSaleModal?: (product: InventoryItem) => void;
  onOpenEditModal?: (product: InventoryItem) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onOpenSaleModal,
  onOpenEditModal,
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const dateStr = product.createdAt
    ? new Date(product.createdAt * 1000).toLocaleString()
    : "Unknown";

  const getStockStatus = (qty: number) => {
    if (qty === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-500/15 text-red-400 border-red-500/30",
        dot: "bg-red-400",
      };
    }
    if (qty <= 5) {
      return {
        label: `Low Stock (${qty} left)`,
        color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        dot: "bg-amber-400",
      };
    }
    return {
      label: "Healthy Stock",
      color: "bg-brand-green/15 text-brand-green border-brand-green/30",
      dot: "bg-brand-green",
    };
  };

  const status = getStockStatus(product.quantity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-charcoal-900 border border-charcoal-750 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-purple/15 text-brand-purple border border-brand-purple/20">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Product Details</h3>
              <p className="text-xs text-charcoal-400">On-chain Item #{product.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Info */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-white leading-tight">
                {product.name}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
              <span className="text-[11px] text-charcoal-400 uppercase tracking-wider block font-medium">
                Stock
              </span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">
                {product.quantity}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
              <span className="text-[11px] text-charcoal-400 uppercase tracking-wider block font-medium">
                Unit Price
              </span>
              <span className="text-xl font-bold text-brand-purple font-mono mt-1 block">
                {product.price}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
              <span className="text-[11px] text-charcoal-400 uppercase tracking-wider block font-medium">
                Units Sold
              </span>
              <span className="text-xl font-bold text-brand-green font-mono mt-1 block">
                {product.totalSold || 0}
              </span>
            </div>
          </div>

          {/* Metadata Rows */}
          <div className="space-y-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800/80 p-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-charcoal-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created Date:</span>
              </div>
              <span className="text-charcoal-200 font-mono">{dateStr}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-charcoal-400">
                <User className="h-3.5 w-3.5" />
                <span>Owner Wallet:</span>
              </div>
              <span className="text-charcoal-200 font-mono truncate max-w-[200px]">
                {product.owner}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-charcoal-400">BOT Chain Explorer:</span>
              <a
                href={`https://scan.botchain.ai/address/${product.owner}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-purple hover:underline flex items-center gap-1"
              >
                <span>View on BOT Chain Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenEditModal?.(product);
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 hover:text-white transition-colors"
            >
              Edit Product
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenSaleModal?.(product);
              }}
              disabled={product.quantity === 0}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-brand-green hover:bg-brand-green-dark text-white transition-colors disabled:opacity-40"
            >
              Record Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


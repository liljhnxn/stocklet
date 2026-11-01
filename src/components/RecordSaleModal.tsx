"use client";

import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { InventoryItem } from "../config/contract";

interface RecordSaleModalProps {
  product: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordSale: (productId: number, quantitySold: number) => Promise<void>;
  isPending: boolean;
}

export function RecordSaleModal({
  product,
  isOpen,
  onClose,
  onRecordSale,
  isPending,
}: RecordSaleModalProps) {
  const [quantitySold, setQuantitySold] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setQuantitySold("");
    setError("");
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const soldNum = parseInt(quantitySold, 10) || 0;
  const remainingStock = product.quantity - soldNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (soldNum <= 0) {
      setError("Quantity sold must be at least 1 unit.");
      return;
    }

    if (soldNum > product.quantity) {
      setError(`Cannot sell more than available stock (${product.quantity} units).`);
      return;
    }

    try {
      await onRecordSale(product.id, soldNum);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to record sale";
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-750 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-green/15 text-brand-green border border-brand-green/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Record Sale</h3>
              <p className="text-xs text-charcoal-400">Deducts stock directly on-chain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-800 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Info Box */}
          <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-charcoal-400">Product:</span>
              <span className="text-white font-medium">{product.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-charcoal-400">Available Stock:</span>
              <span className="font-mono font-semibold text-white">
                {product.quantity} units
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-charcoal-400">Unit Price:</span>
              <span className="font-mono text-charcoal-300">
                {product.price} units
              </span>
            </div>
          </div>

          {/* Sale Input */}
          <div>
            <label className="block text-xs font-medium text-charcoal-300 mb-1.5">
              Quantity Sold <span className="text-brand-green">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={product.quantity}
                step="1"
                value={quantitySold}
                onChange={(e) => setQuantitySold(e.target.value)}
                placeholder={`1 to ${product.quantity}`}
                required
                disabled={isPending || product.quantity === 0}
                className="w-full px-3.5 py-2.5 bg-charcoal-950 border border-charcoal-750 rounded-xl text-white placeholder:text-charcoal-600 focus:outline-none focus:border-brand-green text-sm transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setQuantitySold(product.quantity.toString())}
                disabled={isPending || product.quantity === 0}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-medium bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white rounded-md transition-colors"
              >
                Max
              </button>
            </div>
          </div>

          {/* Live Preview */}
          {soldNum > 0 && soldNum <= product.quantity && (
            <div className="p-3 rounded-xl bg-brand-green/10 border border-brand-green/20 text-xs text-brand-green flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Remaining stock after sale:</span>
              </div>
              <span className="font-mono font-bold text-sm">
                {remainingStock} units
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-charcoal-400 hover:text-white hover:bg-charcoal-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || product.quantity === 0 || soldNum <= 0 || soldNum > product.quantity}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white font-medium text-sm transition-all shadow-md shadow-brand-green/20 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Recording Sale...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Confirm Sale</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


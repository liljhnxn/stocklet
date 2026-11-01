"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Edit3 } from "lucide-react";
import { InventoryItem } from "../config/contract";

interface EditProductModalProps {
  product: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (productId: number, name: string, quantity: number, price: number) => Promise<void>;
  isPending: boolean;
}

export function EditProductModal({
  product,
  isOpen,
  onClose,
  onUpdateProduct,
  isPending,
}: EditProductModalProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setQuantity(product.quantity.toString());
      setPrice(product.price.toString());
      setError("");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a valid product name.");
      return;
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      setError("Quantity must be a valid whole number (0 or higher).");
      return;
    }

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a valid whole number (0 or higher).");
      return;
    }

    try {
      await onUpdateProduct(product.id, name.trim(), qtyNum, priceNum);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update product";
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-750 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-charcoal-800 text-brand-purple border border-charcoal-700">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Edit Product</h3>
              <p className="text-xs text-charcoal-400">Product #{product.id}</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal-300 mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              disabled={isPending}
              className="w-full px-3.5 py-2.5 bg-charcoal-950 border border-charcoal-750 rounded-xl text-white placeholder:text-charcoal-600 focus:outline-none focus:border-brand-purple text-sm transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1.5">
                Current Stock
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={isPending}
                className="w-full px-3.5 py-2.5 bg-charcoal-950 border border-charcoal-750 rounded-xl text-white placeholder:text-charcoal-600 focus:outline-none focus:border-brand-purple text-sm transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1.5">
                Unit Price
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={isPending}
                className="w-full px-3.5 py-2.5 bg-charcoal-950 border border-charcoal-750 rounded-xl text-white placeholder:text-charcoal-600 focus:outline-none focus:border-brand-purple text-sm transition-colors font-mono"
              />
            </div>
          </div>

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
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white font-medium text-sm transition-all shadow-md shadow-brand-purple/20 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


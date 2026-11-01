"use client";

import React, { useState } from "react";
import { Info, X } from "lucide-react";

export function PublicNoticeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-charcoal-900 border-y border-charcoal-800/80 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-charcoal-300">
          <Info className="h-4 w-4 text-brand-purple flex-shrink-0" />
          <span>
            <strong className="text-charcoal-100 font-medium">Public Blockchain Notice:</strong> All product and sales records are immutably and publicly visible on Botchain Testnet. Do not store sensitive or confidential business information.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-charcoal-500 hover:text-charcoal-300 transition-colors p-1"
          aria-label="Dismiss notice"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}


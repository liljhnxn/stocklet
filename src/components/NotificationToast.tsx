"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "loading" | "success" | "error";
  title: string;
  message: string;
  txHash?: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl p-4 shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "success"
              ? "bg-charcoal-900/95 border-brand-green/40 text-charcoal-100"
              : toast.type === "error"
              ? "bg-charcoal-900/95 border-red-500/40 text-charcoal-100"
              : "bg-charcoal-900/95 border-brand-purple/40 text-charcoal-100"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === "loading" && (
                <Loader2 className="h-5 w-5 text-brand-purple animate-spin" />
              )}
              {toast.type === "success" && (
                <CheckCircle2 className="h-5 w-5 text-brand-green" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-semibold text-white tracking-wide">
                {toast.title}
              </h5>
              <p className="text-xs text-charcoal-300 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>

              {toast.txHash && (
                <a
                  href={`https://scan.botchain.ai/tx/${toast.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-purple hover:text-brand-purple-light font-mono mt-2 underline underline-offset-2"
                >
                  <span>View on BOT Chain Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-charcoal-400 hover:text-white p-1 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

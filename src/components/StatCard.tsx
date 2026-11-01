"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "purple" | "green" | "yellow" | "default";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "purple":
        return {
          iconBg: "bg-brand-purple/15 text-brand-purple border border-brand-purple/20",
          glow: "group-hover:border-brand-purple/40",
          valColor: "text-white",
        };
      case "green":
        return {
          iconBg: "bg-brand-green/15 text-brand-green border border-brand-green/20",
          glow: "group-hover:border-brand-green/40",
          valColor: "text-brand-green",
        };
      case "yellow":
        return {
          iconBg: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
          glow: "group-hover:border-amber-500/40",
          valColor: "text-amber-400",
        };
      default:
        return {
          iconBg: "bg-charcoal-800 text-charcoal-300 border border-charcoal-700",
          glow: "group-hover:border-charcoal-600",
          valColor: "text-white",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`group relative rounded-2xl bg-charcoal-900 border border-charcoal-800 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${styles.glow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">
            {title}
          </p>
          <h4 className={`text-2xl font-bold mt-1.5 font-mono ${styles.valColor}`}>
            {value}
          </h4>
          {subtitle && (
            <p className="text-xs text-charcoal-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${styles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}


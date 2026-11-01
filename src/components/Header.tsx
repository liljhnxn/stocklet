"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { botchainTestnet } from "../config/chains";
import { Package, Wallet, LogOut, ChevronDown, Check, Copy, ExternalLink, AlertTriangle } from "lucide-react";
import { STOCKLET_CONTRACT_ADDRESS } from "../config/contract";

interface HeaderProps {
  customContractAddress?: string;
  onUpdateContractAddress?: (newAddress: string) => void;
}

export function Header({ customContractAddress, onUpdateContractAddress }: HeaderProps) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempAddress, setTempAddress] = useState(customContractAddress || STOCKLET_CONTRACT_ADDRESS);

  const isCorrectChain = chainId === botchainTestnet.id || chainId === 31337;

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeContract = customContractAddress || STOCKLET_CONTRACT_ADDRESS;

  return (
    <header className="border-b border-charcoal-800 bg-charcoal-900/80 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-purple to-brand-green/80 flex items-center justify-center shadow-lg shadow-brand-purple/20 ring-1 ring-white/10">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Stocklet
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                Web3
              </span>
            </div>
            <p className="text-xs text-charcoal-400 font-normal hidden sm:block">
              Know what you have. Track what you sell.
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          {isConnected && (
            <div>
              {isCorrectChain ? (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-850 border border-charcoal-700/60 text-xs text-charcoal-300">
                  <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
                  <span>{chainId === 968 ? "Botchain Testnet" : "Hardhat Node"}</span>
                </div>
              ) : (
                <button
                  onClick={() => switchChain?.({ chainId: botchainTestnet.id })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Switch to Botchain</span>
                </button>
              )}
            </div>
          )}

          {/* Contract Address Badge */}
          <button
            onClick={() => setShowConfigModal(true)}
            title="Configure Smart Contract Address"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700/50 text-xs text-charcoal-400 hover:text-charcoal-200 transition-colors"
          >
            <span className="text-charcoal-500">Contract:</span>
            <span className="font-mono text-charcoal-300">
              {activeContract && activeContract !== "0x0000000000000000000000000000000000000000"
                ? `${activeContract.slice(0, 6)}...${activeContract.slice(-4)}`
                : "Not Configured"}
            </span>
          </button>

          {/* Wallet Connect Button */}
          {!isConnected ? (
            <button
              onClick={() => {
                const connector = connectors[0];
                if (connector) connect({ connector });
              }}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-purple text-white font-medium text-sm transition-all shadow-md shadow-brand-purple/20 disabled:opacity-50"
            >
              <Wallet className="h-4 w-4" />
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-charcoal-850 border border-charcoal-700/80 hover:border-brand-purple/50 transition-all text-sm"
              >
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-green flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {address?.slice(2, 4)}
                </div>
                <span className="font-mono text-xs text-charcoal-200">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-charcoal-400" />
              </button>

              {/* Wallet Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-charcoal-850 border border-charcoal-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="text-xs text-charcoal-400 font-medium px-2 py-1">
                    Connected Business Wallet
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-charcoal-900 border border-charcoal-800 my-1.5">
                    <span className="font-mono text-xs text-charcoal-200 truncate">
                      {address}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-charcoal-800 rounded text-charcoal-400 hover:text-white transition-colors"
                      title="Copy Address"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-brand-green" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <a
                    href={`https://scan.bohr.life/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-2 py-2 text-xs text-charcoal-300 hover:text-white hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    <span>View on BohrScan</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <div className="my-1.5 border-t border-charcoal-800" />

                  <button
                    onClick={() => {
                      disconnect();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contract Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-700 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Smart Contract Configuration</h3>
            <p className="text-xs text-charcoal-400 mb-4">
              Enter the deployed Stocklet contract address on Botchain Testnet (Chain ID 968) or Hardhat Localhost.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-charcoal-300 mb-1">
                Contract Address (0x...)
              </label>
              <input
                type="text"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value.trim())}
                placeholder="0x..."
                className="w-full px-3 py-2 text-sm bg-charcoal-950 border border-charcoal-700 rounded-xl text-white font-mono placeholder:text-charcoal-600 focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateContractAddress) {
                    onUpdateContractAddress(tempAddress);
                  }
                  setShowConfigModal(false);
                }}
                className="px-4 py-2 text-xs font-medium bg-brand-purple hover:bg-brand-purple-dark text-white rounded-lg transition-colors"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


"use client";

import { useState } from "react";
import {
  Receipt,
  Search,
  ArrowRight,
  Loader2,
  Download,
  Share2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "@/lib/api";

const CHAINS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "base", label: "Base" },
];

interface ReceiptResult {
  tx_hash: string;
  chain: string;
  action_summary: string;
  svg_card: string;
  cost_breakdown: {
    gas_eth: string;
    gas_usd: string;
    value_eth: string;
    value_usd: string;
    total_eth: string;
    total_usd: string;
  } | null;
  events: { name: string; address: string }[];
  ai_summary: string;
}

export default function ReceiptsPage() {
  const [txHash, setTxHash] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptResult | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReceipt(null);

    try {
      const data = (await apiClient("/shield/generate-receipt", {
        method: "POST",
        body: JSON.stringify({ tx_hash: txHash, chain }),
      })) as ReceiptResult;
      setReceipt(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!receipt?.svg_card) return;
    const blob = new Blob([receipt.svg_card], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receipt.tx_hash.slice(0, 10)}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Smart Receipts</h1>
        <p className="text-text-secondary text-sm mt-1">
          Generate beautiful, shareable receipts for any transaction
        </p>
      </div>

      {/* Generator form */}
      <form
        onSubmit={handleGenerate}
        className="bg-white border border-border rounded-xl p-6 space-y-4 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Transaction Hash
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x… transaction hash"
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-white border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text-primary/10 focus:border-text-primary transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Chain
            </label>
            <div className="relative">
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="appearance-none w-full md:w-40 px-4 py-3 rounded-lg bg-white border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-text-primary/10 focus:border-text-primary transition-all pr-10"
              >
                {CHAINS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-text-primary text-white font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Receipt className="w-4 h-4" /> Generate Receipt{" "}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Receipt result */}
      {receipt && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SVG preview */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Receipt Card</h2>
            <div
              className="rounded-lg overflow-hidden bg-surface"
              dangerouslySetInnerHTML={{ __html: receipt.svg_card }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface text-text-primary text-sm font-medium hover:bg-surface-2 transition-colors"
              >
                <Download className="w-4 h-4" /> Download SVG
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface text-text-primary text-sm font-medium hover:bg-surface-2 transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-text-muted">Transaction</dt>
                  <dd className="font-mono text-sm text-text-primary mt-0.5 truncate">
                    {receipt.tx_hash}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Action</dt>
                  <dd className="text-sm text-text-primary mt-0.5">
                    {receipt.action_summary}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Chain</dt>
                  <dd className="text-sm text-text-primary capitalize mt-0.5">
                    {receipt.chain}
                  </dd>
                </div>
              </dl>
            </div>

            {receipt.cost_breakdown && (
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium mb-4">Cost Breakdown</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-text-secondary">Gas Fee</dt>
                    <dd className="text-sm font-medium text-text-primary">
                      {receipt.cost_breakdown.gas_eth} ETH
                      <span className="text-text-muted font-normal ml-1">
                        ({receipt.cost_breakdown.gas_usd})
                      </span>
                    </dd>
                  </div>
                  {receipt.cost_breakdown.value_eth !== "0.000000" && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-text-secondary">Value</dt>
                      <dd className="text-sm font-medium text-text-primary">
                        {receipt.cost_breakdown.value_eth} ETH
                        <span className="text-text-muted font-normal ml-1">
                          ({receipt.cost_breakdown.value_usd})
                        </span>
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-3">
                    <dt className="text-sm text-text-secondary">Total</dt>
                    <dd className="text-sm font-bold text-text-primary">
                      {receipt.cost_breakdown.total_eth} ETH
                      <span className="text-text-muted font-normal ml-1">
                        ({receipt.cost_breakdown.total_usd})
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {receipt.events.length > 0 && (
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium mb-4">Events</h2>
                <div className="space-y-2">
                  {receipt.events.map((evt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      {evt.name}
                      {evt.address && (
                        <span className="text-text-muted font-mono text-xs truncate">
                          {evt.address}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

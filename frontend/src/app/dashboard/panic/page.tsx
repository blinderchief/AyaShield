"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ShieldOff,
  Loader2,
  CheckCircle,
  ExternalLink,
  Search,
  ChevronDown,
} from "lucide-react";
import { apiClient } from "@/lib/api";

const CHAINS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "base", label: "Base" },
];

interface Approval {
  token_address: string;
  token_name: string;
  spender: string;
  spender_name: string | null;
  amount: string;
  is_unlimited: boolean;
  risk_score: number;
}

interface RevokeTx {
  to: string;
  data: string;
  description: string;
}

interface RevokeResult {
  total_approvals: number;
  risky_approvals: number;
  total_at_risk_usd: string;
  approvals: Approval[];
  revoke_txs: RevokeTx[];
  ai_explanation: string;
}

function riskColors(score: number) {
  if (score >= 70) return "text-danger bg-red-50";
  if (score >= 40) return "text-warning bg-amber-50";
  return "text-success bg-green-50";
}

export default function PanicPage() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RevokeResult | null>(null);
  const [error, setError] = useState("");
  const [revokedIndexes, setRevokedIndexes] = useState<Set<number>>(new Set());

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setRevokedIndexes(new Set());

    try {
      const data = (await apiClient("/shield/emergency-revoke", {
        method: "POST",
        body: JSON.stringify({
          wallet_address: address,
          chain,
          risk_threshold: 50,
        }),
      })) as RevokeResult;
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const markRevoked = (idx: number) => {
    setRevokedIndexes((prev) => new Set([...prev, idx]));
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-danger" />
          Emergency Revoke
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Scan your wallet for risky approvals and revoke them instantly
        </p>
      </div>

      {/* Scan form */}
      <form
        onSubmit={handleScan}
        className="bg-white border border-border rounded-xl p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Wallet Address
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x… your wallet address"
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
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-danger text-white font-medium hover:bg-danger/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldOff className="w-4 h-4" /> Scan Approvals
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-border rounded-xl p-5 text-center shadow-sm">
              <p className="text-3xl font-semibold text-text-primary">
                {result.total_approvals}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Approvals Found
              </p>
            </div>
            <div className="bg-white border border-border rounded-xl p-5 text-center shadow-sm">
              <p className="text-3xl font-semibold text-danger">
                {result.risky_approvals}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                High Risk
              </p>
            </div>
            <div className="bg-white border border-border rounded-xl p-5 text-center shadow-sm">
              <p className="text-3xl font-semibold text-success">
                {revokedIndexes.size}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Revoked
              </p>
            </div>
          </div>

          {/* Approvals table */}
          {result.approvals.length > 0 && (
            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-medium">Approvals</h2>
              </div>
              <div className="divide-y divide-border">
                {result.approvals.map((approval, idx) => {
                  const revoked = revokedIndexes.has(idx);
                  return (
                    <div
                      key={idx}
                      className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                        revoked ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary text-sm">
                          {approval.token_name || approval.token_address.slice(0, 10) + "…"}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 truncate">
                          Spender: {approval.spender_name || approval.spender}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {approval.is_unlimited && (
                          <span className="text-xs font-medium text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                            UNLIMITED
                          </span>
                        )}
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColors(
                            approval.risk_score
                          )}`}
                        >
                          {approval.risk_score}
                        </span>
                        {revoked ? (
                          <span className="flex items-center gap-1 text-xs text-success font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Revoked
                          </span>
                        ) : (
                          <button
                            onClick={() => markRevoked(idx)}
                            className="text-xs font-medium text-danger hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Revoke transactions (raw calldata for wallet) */}
          {result.revoke_txs.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <h2 className="font-medium mb-4">
                Revoke Transactions ({result.revoke_txs.length})
              </h2>
              <p className="text-sm text-text-secondary mb-4">
                Submit these transactions via your wallet to revoke the approvals above.
              </p>
              <div className="space-y-3">
                {result.revoke_txs.map((tx, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-surface text-sm space-y-1"
                  >
                    <p className="text-text-primary font-medium">
                      {tx.description}
                    </p>
                    <p className="text-text-muted font-mono text-xs truncate">
                      To: {tx.to}
                    </p>
                    <p className="text-text-muted font-mono text-xs truncate">
                      Data: {tx.data}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.approvals.length === 0 && (
            <div className="bg-white border border-border rounded-xl p-8 text-center shadow-sm">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <h2 className="text-lg font-medium">All Clear!</h2>
              <p className="text-text-secondary text-sm mt-1">
                No risky approvals found for this wallet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

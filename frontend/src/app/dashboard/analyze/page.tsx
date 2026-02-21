"use client";

import { useState } from "react";
import {
  Search,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { apiClient } from "@/lib/api";

const CHAINS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "base", label: "Base" },
];

interface AnalysisResult {
  risk_score: number;
  risk_level: string;
  risk_color?: string;
  trust_score?: number;
  trust_level?: string;
  trust_color?: string;
  warnings: { level: string; message: string }[];
  ai_explanation?: string;
  function_name?: string;
  function_type?: string;
  decoded_params?: Record<string, string>;
  simulation?: {
    success: boolean;
    gas_used: number;
    error?: string;
  };
  // Contract-specific fields
  contract_name?: string;
  contract_type?: string;
  is_verified?: boolean;
  is_known_scam?: boolean;
  red_flags?: { severity: string; message: string }[];
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-50 text-danger border-red-200",
    high: "bg-red-50 text-danger border-red-200",
    medium: "bg-amber-50 text-warning border-amber-200",
    low: "bg-green-50 text-success border-green-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
        styles[level] ?? styles.medium
      }`}
    >
      {level === "low" || level === "none" ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <AlertTriangle className="w-3 h-3" />
      )}
      {level.toUpperCase()} RISK
    </span>
  );
}

export default function AnalyzePage() {
  const [mode, setMode] = useState<"transaction" | "contract">("transaction");
  const [input, setInput] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      if (mode === "transaction") {
        const data = (await apiClient("/shield/analyze-transaction", {
          method: "POST",
          body: JSON.stringify({
            to: to || input,
            data: input.startsWith("0x") && input.length > 42 ? input : undefined,
            value: value || "0",
            chain,
          }),
        })) as AnalysisResult;
        setResult(data);
      } else {
        const data = (await apiClient("/shield/analyze-contract", {
          method: "POST",
          body: JSON.stringify({ address: input, chain }),
        })) as AnalysisResult;
        // Map contract response to unified result shape
        setResult({
          ...data,
          risk_score: data.risk_score ?? (100 - (data.trust_score ?? 50)),
          risk_level: data.risk_level ?? "medium",
          warnings: (data.red_flags ?? []).map((f) => ({ level: f.severity, message: f.message })),
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Analyze</h1>
        <p className="text-text-secondary text-sm mt-1">
          Pre-sign simulation and risk analysis
        </p>
      </div>

      {/* Mode switch */}
      <div className="flex gap-2">
        {(["transaction", "contract"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setResult(null);
              setError("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? "bg-surface-2 text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-surface"
            }`}
          >
            {m === "transaction" ? "Transaction" : "Contract"}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleAnalyze} className="bg-white border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {mode === "transaction" ? "Calldata or Contract Address" : "Contract Address"}
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "transaction"
                    ? "0x… calldata or address"
                    : "0x… contract address"
                }
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

        {mode === "transaction" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                To Address
              </label>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="0x… recipient"
                className="w-full px-4 py-3 rounded-lg bg-white border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text-primary/10 focus:border-text-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Value (ETH)
              </label>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-3 rounded-lg bg-white border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text-primary/10 focus:border-text-primary transition-all"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-text-primary text-white font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Analyze <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium">Analysis Result</h2>
                <p className="text-sm text-text-secondary mt-0.5">
                  {mode === "transaction" ? "Transaction simulation" : "Contract analysis"} complete
                </p>
              </div>
              <RiskBadge level={result.risk_level} />
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-surface">
                <p className="text-sm text-text-secondary">Risk Score</p>
                <p className={`text-2xl font-bold ${
                  result.risk_score >= 70
                    ? "text-danger"
                    : result.risk_score >= 40
                    ? "text-warning"
                    : "text-success"
                }`}>
                  {result.risk_score}
                  <span className="text-sm text-text-muted font-normal">/100</span>
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface">
                <p className="text-sm text-text-secondary">Trust Score</p>
                <p className={`text-2xl font-bold ${
                  (result.trust_score ?? 0) >= 70
                    ? "text-success"
                    : (result.trust_score ?? 0) >= 40
                    ? "text-warning"
                    : "text-danger"
                }`}>
                  {result.trust_score ?? "—"}
                  <span className="text-sm text-text-muted font-normal">/100</span>
                </p>
              </div>
            </div>

            {/* Function info */}
            {result.function_name && (
              <div className="p-4 rounded-lg bg-surface mb-4">
                <p className="text-sm text-text-secondary">Function</p>
                <p className="font-mono text-sm text-text-primary mt-1">
                  {result.function_name}
                </p>
              </div>
            )}

            {/* Simulation */}
            {result.simulation && (
              <div className="p-4 rounded-lg bg-surface mb-4">
                <p className="text-sm text-text-secondary mb-2">Simulation</p>
                <div className="flex items-center gap-3">
                  {result.simulation.success ? (
                    <ShieldCheck className="w-5 h-5 text-success" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-danger" />
                  )}
                  <span className="text-sm text-text-primary">
                    {result.simulation.success
                      ? `Passes — Est. gas: ${result.simulation.gas_used.toLocaleString()}`
                      : `Reverts — ${result.simulation.error ?? "Unknown error"}`}
                  </span>
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-text-secondary">Warnings</p>
                {result.warnings.map((w, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                      w.level === "high" || w.level === "critical"
                        ? "bg-red-50 text-danger"
                        : w.level === "medium"
                        ? "bg-amber-50 text-warning"
                        : "bg-blue-50 text-accent"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    {w.message}
                  </div>
                ))}
              </div>
            )}

            {/* AI Explanation */}
            {result.ai_explanation && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium text-accent">AI Analysis</p>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {result.ai_explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

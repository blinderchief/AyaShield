import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Clock,
} from "lucide-react";
import Badge from "@/components/ui/badge";

interface TransactionCardProps {
  riskScore: number;
  riskLevel: string;
  functionName?: string;
  warnings: { level: string; message: string }[];
  chain: string;
  to?: string;
  value?: string;
  explanation?: string;
}

export default function TransactionCard({
  riskScore,
  riskLevel,
  functionName,
  warnings,
  chain,
  to,
  value,
  explanation,
}: TransactionCardProps) {
  const riskColor =
    riskScore >= 70
      ? "danger"
      : riskScore >= 40
      ? "warning"
      : ("success" as const);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header with risk indicator */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-3">
          {riskScore >= 70 ? (
            <ShieldAlert className="w-5 h-5 text-danger" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-success" />
          )}
          <div>
            <p className="font-semibold text-text-primary text-sm">
              {functionName || "Transaction"}
            </p>
            <p className="text-xs text-text-muted capitalize">{chain}</p>
          </div>
        </div>
        <Badge color={riskColor}>
          {riskLevel.toUpperCase()} — {riskScore}
        </Badge>
      </div>

      {/* Details */}
      <div className="p-5 space-y-3">
        {to && (
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-text-secondary">To:</span>
            <span className="font-mono text-text-primary text-xs truncate">
              {to}
            </span>
          </div>
        )}
        {value && value !== "0" && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-text-secondary">Value:</span>
            <span className="font-medium text-text-primary">{value} ETH</span>
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-5 pb-5 space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                w.level === "high" || w.level === "critical"
                  ? "bg-danger/10 text-danger"
                  : w.level === "medium"
                  ? "bg-warning/10 text-warning"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* AI explanation */}
      {explanation && (
        <div className="px-5 pb-5">
          <p className="text-xs text-text-secondary leading-relaxed bg-primary/5 border border-primary/10 rounded-lg p-3">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}

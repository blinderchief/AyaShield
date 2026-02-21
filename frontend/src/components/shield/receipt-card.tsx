import { Receipt, Download, Share2 } from "lucide-react";

interface ReceiptCardProps {
  txHash: string;
  chain: string;
  actionSummary: string;
  feeEth: string;
  feeUsd: string;
  gasUsed: number;
  svgData?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function ReceiptCard({
  txHash,
  chain,
  actionSummary,
  feeEth,
  feeUsd,
  gasUsed,
  svgData,
  onDownload,
  onShare,
}: ReceiptCardProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* SVG preview */}
      {svgData && (
        <div
          className="bg-background"
          dangerouslySetInnerHTML={{ __html: svgData }}
        />
      )}

      {/* Info */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-accent" />
          <p className="text-sm font-medium text-text-primary truncate">
            {actionSummary}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-y-2 text-xs">
          <div>
            <dt className="text-text-muted">Chain</dt>
            <dd className="text-text-primary capitalize mt-0.5">{chain}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Gas Used</dt>
            <dd className="text-text-primary mt-0.5">
              {gasUsed.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Fee</dt>
            <dd className="text-text-primary mt-0.5">
              {feeEth} ETH
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Fee (USD)</dt>
            <dd className="text-text-primary mt-0.5">${feeUsd}</dd>
          </div>
        </dl>

        <p className="font-mono text-[10px] text-text-muted truncate">
          {txHash}
        </p>
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium text-accent hover:bg-accent/5 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </div>
  );
}

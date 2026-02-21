"use client";

import { useState } from "react";
import { ShieldOff, Loader2, AlertTriangle } from "lucide-react";

interface PanicButtonProps {
  onActivate: () => Promise<void>;
  disabled?: boolean;
}

export default function PanicButton({ onActivate, disabled }: PanicButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleClick = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    try {
      await onActivate();
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  const handleCancel = () => setConfirm(false);

  if (confirm) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-danger/30 bg-danger/5 animate-in">
        <AlertTriangle className="w-8 h-8 text-danger" />
        <p className="text-sm text-text-primary font-medium text-center">
          This will scan and prepare revoke transactions for all risky approvals.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleClick}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )}
            Confirm Scan
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl bg-danger/10 border-2 border-danger/20 text-danger font-semibold hover:bg-danger/20 hover:border-danger/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
    >
      <ShieldOff className="w-6 h-6" />
      Emergency Revoke
    </button>
  );
}

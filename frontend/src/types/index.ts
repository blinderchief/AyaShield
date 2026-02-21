/* ========= Enums ========= */

export type Chain =
  | "ethereum"
  | "polygon"
  | "arbitrum"
  | "base"
  | "solana"
  | "ton"
  | "bitcoin";

export type RiskLevel = "critical" | "high" | "medium" | "low" | "none";
export type TrustLevel = "verified" | "established" | "new" | "suspicious" | "malicious";

/* ========= Request types ========= */

export interface AnalyzeTransactionRequest {
  to: string;
  data?: string;
  value?: string;
  from?: string;
  chain: Chain;
}

export interface AnalyzeContractRequest {
  address: string;
  chain: Chain;
}

export interface GenerateReceiptRequest {
  tx_hash: string;
  chain: Chain;
}

export interface EmergencyRevokeRequest {
  wallet_address: string;
  chain: Chain;
  risk_threshold?: number;
}

/* ========= Response types ========= */

export interface Warning {
  level: "critical" | "high" | "medium" | "low" | "info";
  message: string;
}

export interface CostBreakdown {
  gas_eth: string;
  gas_usd: string;
  value_eth: string;
  value_usd: string;
  total_eth: string;
  total_usd: string;
}

export interface TransactionAnalysis {
  risk_score: number;
  risk_level: RiskLevel;
  risk_color: string;
  function_name: string;
  function_type: string;
  decoded_params?: Record<string, string>;
  simulation?: {
    success: boolean;
    gas_used: number;
    error?: string;
  };
  warnings: Warning[];
  destination_info?: Record<string, unknown>;
  ai_explanation: string;
}

export interface ContractAnalysis {
  trust_score: number;
  trust_level: TrustLevel;
  trust_color: string;
  address: string;
  chain: Chain;
  contract_name?: string;
  contract_type?: string;
  is_verified: boolean;
  is_known_scam: boolean;
  age_days?: number;
  tx_count?: number;
  red_flags: { severity: string; message: string }[];
  ai_explanation: string;
}

export interface Receipt {
  tx_hash: string;
  chain: string;
  action_summary: string;
  svg_card: string;
  cost_breakdown: CostBreakdown | null;
  events: { name: string; address: string }[];
  ai_summary: string;
}

export interface Approval {
  token_address: string;
  token_name: string;
  spender: string;
  spender_name: string | null;
  amount: string;
  is_unlimited: boolean;
  risk_score: number;
}

export interface RevokeTransaction {
  to: string;
  data: string;
  description: string;
}

export interface EmergencyRevokeResult {
  total_approvals: number;
  risky_approvals: number;
  total_at_risk_usd: string;
  approvals: Approval[];
  revoke_txs: RevokeTransaction[];
  ai_explanation: string;
}

export interface ShieldStatus {
  shield_score: number;
  transactions_analyzed: number;
  threats_blocked: number;
  receipts_generated: number;
  recent_events: ShieldEvent[];
}

export interface ShieldEvent {
  id: string;
  event_type: string;
  target_address: string;
  risk_score: number;
  chain: Chain;
  created_at: string;
}

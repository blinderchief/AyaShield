from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


# --- Enums ---

class Chain(str, Enum):
    ETHEREUM = "ethereum"
    POLYGON = "polygon"
    ARBITRUM = "arbitrum"
    BASE = "base"
    SOLANA = "solana"
    TON = "ton"
    BITCOIN = "bitcoin"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TrustLevel(str, Enum):
    HIGHLY_TRUSTED = "highly_trusted"
    TRUSTED = "trusted"
    CAUTION = "caution"
    SUSPICIOUS = "suspicious"
    DANGEROUS = "dangerous"


class EventType(str, Enum):
    TX_ANALYSIS = "tx_analysis"
    CONTRACT_ANALYSIS = "contract_analysis"
    RECEIPT = "receipt"
    REVOKE = "revoke"
    STATUS = "status"


# --- Request Schemas ---

class AnalyzeTransactionRequest(BaseModel):
    tx_hash: str | None = Field(None, pattern=r"^0x[a-fA-F0-9]{64}$")
    to: str | None = Field(None, pattern=r"^0x[a-fA-F0-9]{40}$")
    data: str | None = None
    value: str | None = None
    chain: Chain = Chain.ETHEREUM


class AnalyzeContractRequest(BaseModel):
    address: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    chain: Chain = Chain.ETHEREUM


class GenerateReceiptRequest(BaseModel):
    tx_hash: str = Field(..., pattern=r"^0x[a-fA-F0-9]{64}$")
    chain: Chain = Chain.ETHEREUM
    style: str = "default"


class EmergencyRevokeRequest(BaseModel):
    wallet_address: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    chain: Chain = Chain.ETHEREUM
    risk_threshold: int = Field(50, ge=0, le=100)


class ShieldStatusRequest(BaseModel):
    wallet_address: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    chain: Chain = Chain.ETHEREUM


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    chain: Chain = Chain.ETHEREUM


# --- Response Schemas ---

class Warning(BaseModel):
    level: str
    message: str


class TransactionAnalysisResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    risk_color: str
    function_name: str
    function_type: str
    decoded_params: dict | None = None
    simulation: dict | None = None
    warnings: list[Warning] = []
    destination_info: dict | None = None
    ai_explanation: str = ""


class ContractAnalysisResponse(BaseModel):
    trust_score: int = Field(..., ge=0, le=100)
    trust_level: TrustLevel
    trust_color: str
    address: str
    chain: str
    contract_name: str | None = None
    contract_type: str | None = None
    is_verified: bool = False
    is_known_scam: bool = False
    age_days: int | None = None
    tx_count: int | None = None
    red_flags: list[dict] = []
    ai_explanation: str = ""


class CostBreakdown(BaseModel):
    gas_eth: str
    gas_usd: str
    value_eth: str
    value_usd: str
    total_eth: str
    total_usd: str


class ReceiptResponse(BaseModel):
    tx_hash: str
    chain: str
    action_summary: str
    events: list[dict] = []
    cost_breakdown: CostBreakdown | None = None
    svg_card: str = ""
    ai_summary: str = ""


class Approval(BaseModel):
    token_address: str
    token_name: str
    spender: str
    spender_name: str | None = None
    amount: str
    is_unlimited: bool
    risk_score: int


class RevokeTransaction(BaseModel):
    to: str
    data: str
    description: str


class EmergencyRevokeResponse(BaseModel):
    total_approvals: int
    risky_approvals: int
    total_at_risk_usd: str = "$0"
    approvals: list[Approval] = []
    revoke_txs: list[RevokeTransaction] = []
    ai_explanation: str = ""


class ShieldStatusResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    level: str
    total_approvals: int
    risky_approvals: int
    events_last_30d: int = 0
    blocked_threats: int = 0


class ChatResponse(BaseModel):
    intent: str
    message: str
    data: dict | None = None

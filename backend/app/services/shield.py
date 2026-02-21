"""Shield orchestrator — routes requests to modules and assembles responses."""

import logging
import re

from app.models.schemas import (
    AnalyzeContractRequest,
    AnalyzeTransactionRequest,
    ChatRequest,
    ChatResponse,
    ContractAnalysisResponse,
    CostBreakdown,
    EmergencyRevokeRequest,
    EmergencyRevokeResponse,
    GenerateReceiptRequest,
    ReceiptResponse,
    ShieldStatusRequest,
    ShieldStatusResponse,
    TransactionAnalysisResponse,
)
from app.services.ai.gemini import GeminiService
from app.services.receipt.generator import ReceiptGenerator
from app.services.revoke.scanner import ApprovalScanner
from app.services.security.contract_analyzer import ContractAnalyzer, TransactionAnalyzer

logger = logging.getLogger(__name__)


class ShieldOrchestrator:
    def __init__(self):
        self.ai = GeminiService()
        self.tx_analyzer = TransactionAnalyzer()
        self.contract_analyzer = ContractAnalyzer()
        self.receipt_generator = ReceiptGenerator()
        self.approval_scanner = ApprovalScanner()

    async def analyze_transaction(self, req: AnalyzeTransactionRequest) -> TransactionAnalysisResponse:
        result = await self.tx_analyzer.analyze(
            tx_hash=req.tx_hash, to=req.to, data=req.data,
            value=req.value, chain=req.chain.value,
        )

        # AI explanation
        explanation = ""
        try:
            explanation = await self.ai.generate_explanation(result, "tx_analysis")
        except Exception:
            logger.debug("AI explanation failed for tx analysis")

        return TransactionAnalysisResponse(
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            risk_color=result["risk_color"],
            function_name=result["function_name"],
            function_type=result["function_type"],
            decoded_params=result.get("decoded_params"),
            simulation=result.get("simulation"),
            warnings=[{"level": w["level"], "message": w["message"]} for w in result.get("warnings", [])],
            destination_info=result.get("destination_info"),
            ai_explanation=explanation,
        )

    async def analyze_contract(self, req: AnalyzeContractRequest) -> ContractAnalysisResponse:
        result = await self.contract_analyzer.analyze(req.address, req.chain.value)

        explanation = ""
        try:
            explanation = await self.ai.generate_explanation(result, "contract_analysis")
        except Exception:
            logger.debug("AI explanation failed for contract analysis")

        return ContractAnalysisResponse(
            trust_score=result["trust_score"],
            trust_level=result["trust_level"],
            trust_color=result["trust_color"],
            address=result["address"],
            chain=result["chain"],
            contract_name=result.get("contract_name"),
            contract_type=result.get("contract_type"),
            is_verified=result.get("is_verified", False),
            is_known_scam=result.get("is_known_scam", False),
            age_days=result.get("age_days"),
            tx_count=result.get("tx_count"),
            red_flags=result.get("red_flags", []),
            ai_explanation=explanation,
        )

    async def generate_receipt(self, req: GenerateReceiptRequest) -> ReceiptResponse:
        result = await self.receipt_generator.generate(req.tx_hash, req.chain.value)

        ai_summary = ""
        try:
            ai_summary = await self.ai.generate_explanation(result, "receipt")
        except Exception:
            logger.debug("AI summary failed for receipt")

        cost = result.get("cost_breakdown")
        cost_model = CostBreakdown(**cost) if cost else None

        return ReceiptResponse(
            tx_hash=result["tx_hash"],
            chain=result["chain"],
            action_summary=result["action_summary"],
            events=result.get("events", []),
            cost_breakdown=cost_model,
            svg_card=result.get("svg_card", ""),
            ai_summary=ai_summary,
        )

    async def emergency_revoke(self, req: EmergencyRevokeRequest) -> EmergencyRevokeResponse:
        result = await self.approval_scanner.scan_and_revoke(
            req.wallet_address, req.chain.value, req.risk_threshold
        )

        explanation = ""
        try:
            explanation = await self.ai.generate_explanation(result, "revoke")
        except Exception:
            logger.debug("AI explanation failed for revoke")

        return EmergencyRevokeResponse(
            total_approvals=result["total_approvals"],
            risky_approvals=result["risky_approvals"],
            total_at_risk_usd=result.get("total_at_risk_usd", "$0"),
            approvals=result.get("approvals", []),
            revoke_txs=result.get("revoke_txs", []),
            ai_explanation=explanation,
        )

    async def get_status(self, req: ShieldStatusRequest, user_id: str) -> ShieldStatusResponse:
        result = await self.approval_scanner.scan_and_revoke(
            req.wallet_address, req.chain.value, risk_threshold=30
        )

        risky = result["risky_approvals"]
        if risky == 0:
            score, level = 95, "excellent"
        elif risky <= 2:
            score, level = 70, "good"
        elif risky <= 5:
            score, level = 40, "at_risk"
        else:
            score, level = 20, "critical"

        return ShieldStatusResponse(
            score=score,
            level=level,
            total_approvals=result["total_approvals"],
            risky_approvals=risky,
        )

    async def chat(self, req: ChatRequest, user_id: str) -> ChatResponse:
        intent = await self.ai.parse_intent(req.message)
        category = intent.get("category", "general")
        params = intent.get("parameters", {})

        if category == "analyze_tx":
            tx_hash = params.get("tx_hash") or self._extract_hash(req.message)
            if tx_hash:
                from app.models.schemas import AnalyzeTransactionRequest
                r = await self.analyze_transaction(AnalyzeTransactionRequest(tx_hash=tx_hash, chain=req.chain))
                return ChatResponse(intent="analyze_tx", message=r.ai_explanation or "Analysis complete.", data=r.model_dump())

        if category == "analyze_contract":
            address = params.get("address") or self._extract_address(req.message)
            if address:
                from app.models.schemas import AnalyzeContractRequest
                r = await self.analyze_contract(AnalyzeContractRequest(address=address, chain=req.chain))
                return ChatResponse(intent="analyze_contract", message=r.ai_explanation or "Analysis complete.", data=r.model_dump())

        if category == "revoke":
            return ChatResponse(
                intent="revoke",
                message="To scan approvals and generate revoke transactions, please use the Emergency Revoke feature with your wallet address.",
                data=None,
            )

        if category == "receipt":
            tx_hash = params.get("tx_hash") or self._extract_hash(req.message)
            if tx_hash:
                from app.models.schemas import GenerateReceiptRequest
                r = await self.generate_receipt(GenerateReceiptRequest(tx_hash=tx_hash, chain=req.chain))
                return ChatResponse(intent="receipt", message=r.ai_summary or "Receipt generated.", data=r.model_dump())

        # General / help
        return ChatResponse(
            intent="general",
            message="I'm Aya Shield, your AI-powered crypto security guardian. I can analyze transactions, check contracts for risks, generate shareable receipts, and help you revoke risky approvals. What would you like to do?",
            data=None,
        )

    def _extract_hash(self, text: str) -> str | None:
        match = re.search(r"0x[a-fA-F0-9]{64}", text)
        return match.group(0) if match else None

    def _extract_address(self, text: str) -> str | None:
        match = re.search(r"0x[a-fA-F0-9]{40}", text)
        return match.group(0) if match else None

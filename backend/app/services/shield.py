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

        # AI explanation with enhanced agent
        explanation = ""
        risk_assessment = None
        try:
            explanation = await self.ai.generate_explanation(result, "tx_analysis")
            # Get AI risk assessment
            risk_assessment = await self.ai.assess_risk_level(
                result["risk_score"],
                result.get("warnings", [])
            )
        except Exception:
            logger.debug("AI explanation failed for tx analysis")

        response = TransactionAnalysisResponse(
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
        
        # Attach risk assessment if available
        if risk_assessment:
            response.ai_explanation = f"{risk_assessment['explanation']}\n\n{explanation}" if explanation else risk_assessment['explanation']
        
        return response

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
        """
        AI Agent chat with intelligent intent parsing and tool execution.
        
        The agent will:
        1. Parse the user's intent with confidence scoring
        2. Execute appropriate tools/analysis
        3. Generate contextual responses
        """
        # Parse intent with confidence
        intent = await self.ai.parse_intent(req.message)
        category = intent.get("category", "general")
        params = intent.get("parameters", {})
        confidence = intent.get("confidence", 0.5)
        
        logger.info(f"Chat intent: {category} (confidence: {confidence:.2f})")

        # Handle analyze_tx intent
        if category == "analyze_tx":
            tx_hash = params.get("tx_hash") or self._extract_hash(req.message)
            if tx_hash:
                from app.models.schemas import AnalyzeTransactionRequest
                r = await self.analyze_transaction(AnalyzeTransactionRequest(tx_hash=tx_hash, chain=req.chain))
                return ChatResponse(
                    intent="analyze_tx",
                    message=r.ai_explanation or "Transaction analysis complete. See the detailed breakdown above.",
                    data=r.model_dump(),
                )
            return ChatResponse(
                intent="analyze_tx",
                message="I'd be happy to analyze a transaction for you. Please provide the transaction hash (0x...).",
                data=None,
            )

        # Handle analyze_contract intent
        if category == "analyze_contract":
            address = params.get("address") or self._extract_address(req.message)
            if address:
                from app.models.schemas import AnalyzeContractRequest
                r = await self.analyze_contract(AnalyzeContractRequest(address=address, chain=req.chain))
                return ChatResponse(
                    intent="analyze_contract",
                    message=r.ai_explanation or "Contract analysis complete. Review the trust score and findings above.",
                    data=r.model_dump(),
                )
            return ChatResponse(
                intent="analyze_contract",
                message="I can analyze any contract for you. Please provide the contract address (0x...).",
                data=None,
            )

        # Handle revoke intent
        if category == "revoke":
            wallet = params.get("wallet_address") or self._extract_address(req.message)
            if wallet:
                from app.models.schemas import EmergencyRevokeRequest
                r = await self.emergency_revoke(EmergencyRevokeRequest(wallet_address=wallet, chain=req.chain))
                return ChatResponse(
                    intent="revoke",
                    message=r.ai_explanation or f"Found {r.total_approvals} approvals, {r.risky_approvals} are risky.",
                    data=r.model_dump(),
                )
            return ChatResponse(
                intent="revoke",
                message="I can scan your wallet for risky token approvals. Please provide your wallet address or connect your wallet.",
                data=None,
            )

        # Handle receipt intent
        if category == "receipt":
            tx_hash = params.get("tx_hash") or self._extract_hash(req.message)
            if tx_hash:
                from app.models.schemas import GenerateReceiptRequest
                r = await self.generate_receipt(GenerateReceiptRequest(tx_hash=tx_hash, chain=req.chain))
                return ChatResponse(
                    intent="receipt",
                    message=r.ai_summary or "Your transaction receipt is ready!",
                    data=r.model_dump(),
                )
            return ChatResponse(
                intent="receipt",
                message="I can generate a shareable receipt for any transaction. Please provide the transaction hash (0x...).",
                data=None,
            )

        # Handle explanation requests
        if category == "explain":
            concept = params.get("concept", req.message)
            explanation = await self.ai.explain_concept(concept)
            return ChatResponse(
                intent="explain",
                message=explanation,
                data=None,
            )

        # Handle general / help with agent conversation
        agent_response = await self.ai.agent_chat(req.message)
        
        # If agent suggested tool calls, we could execute them here
        # For now, return the agent's natural language response
        
        return ChatResponse(
            intent="general",
            message=agent_response.get("response") or self._get_help_message(),
            data={"suggested_actions": agent_response.get("suggested_actions", [])},
        )

    def _extract_hash(self, text: str) -> str | None:
        match = re.search(r"0x[a-fA-F0-9]{64}", text)
        return match.group(0) if match else None

    def _extract_address(self, text: str) -> str | None:
        match = re.search(r"0x[a-fA-F0-9]{40}", text)
        return match.group(0) if match else None
    
    def _get_help_message(self) -> str:
        return """I'm Aya Shield, your AI-powered crypto security guardian. Here's what I can help you with:

**🔍 Analyze Transactions** — Paste any transaction hash and I'll break down exactly what it does, flag risks, and tell you if it's safe.

**📋 Check Contracts** — Give me a contract address and I'll assess its trustworthiness, check for honeypots, and identify red flags.

**🧾 Generate Receipts** — Create shareable receipt cards for your transactions with cost breakdowns and AI summaries.

**🚨 Emergency Revoke** — Scan your wallet for dangerous token approvals and help you revoke them before they drain your funds.

What would you like to do?"""

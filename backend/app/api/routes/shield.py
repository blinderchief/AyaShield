import logging

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser
from app.db.supabase import log_shield_event
from app.models.schemas import (
    AnalyzeContractRequest,
    AnalyzeTransactionRequest,
    ChatRequest,
    ChatResponse,
    ContractAnalysisResponse,
    EmergencyRevokeRequest,
    EmergencyRevokeResponse,
    GenerateReceiptRequest,
    ReceiptResponse,
    ShieldStatusRequest,
    ShieldStatusResponse,
    TransactionAnalysisResponse,
)
from app.services.shield import ShieldOrchestrator

router = APIRouter(prefix="/shield", tags=["shield"])
logger = logging.getLogger(__name__)

_shield_instance: ShieldOrchestrator | None = None


def _get_shield() -> ShieldOrchestrator:
    global _shield_instance
    if _shield_instance is None:
        _shield_instance = ShieldOrchestrator()
    return _shield_instance


@router.post("/analyze-transaction", response_model=TransactionAnalysisResponse)
async def analyze_transaction(req: AnalyzeTransactionRequest, user: CurrentUser):
    shield = _get_shield()
    try:
        result = await shield.analyze_transaction(req)
        await log_shield_event(
            user["id"], "tx_analysis", req.chain.value,
            tx_hash=req.tx_hash, target_address=req.to,
            risk_score=result.risk_score, result=result.model_dump(),
        )
        return result
    except Exception as e:
        logger.exception("Transaction analysis failed")
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")


@router.post("/analyze-contract", response_model=ContractAnalysisResponse)
async def analyze_contract(req: AnalyzeContractRequest, user: CurrentUser):
    shield = _get_shield()
    try:
        result = await shield.analyze_contract(req)
        await log_shield_event(
            user["id"], "contract_analysis", req.chain.value,
            target_address=req.address, trust_score=result.trust_score,
            result=result.model_dump(),
        )
        return result
    except Exception as e:
        logger.exception("Contract analysis failed")
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")


@router.post("/generate-receipt", response_model=ReceiptResponse)
async def generate_receipt(req: GenerateReceiptRequest, user: CurrentUser):
    shield = _get_shield()
    try:
        result = await shield.generate_receipt(req)
        await log_shield_event(
            user["id"], "receipt", req.chain.value,
            tx_hash=req.tx_hash, result={"action_summary": result.action_summary},
        )
        return result
    except Exception as e:
        logger.exception("Receipt generation failed")
        raise HTTPException(status_code=500, detail="Receipt generation failed. Please try again.")


@router.post("/emergency-revoke", response_model=EmergencyRevokeResponse)
async def emergency_revoke(req: EmergencyRevokeRequest, user: CurrentUser):
    shield = _get_shield()
    try:
        result = await shield.emergency_revoke(req)
        await log_shield_event(
            user["id"], "revoke", req.chain.value,
            target_address=req.wallet_address, risk_score=result.risky_approvals,
            result={"total": result.total_approvals, "risky": result.risky_approvals},
        )
        return result
    except Exception as e:
        logger.exception("Emergency revoke failed")
        raise HTTPException(status_code=500, detail="Revoke scan failed. Please try again.")


@router.post("/status", response_model=ShieldStatusResponse)
async def shield_status(req: ShieldStatusRequest, user: CurrentUser):
    shield = _get_shield()
    try:
        return await shield.get_status(req, user_id=user["id"])
    except Exception as e:
        logger.exception("Shield status check failed")
        raise HTTPException(status_code=500, detail="Status check failed.")


@router.get("/status/me")
async def shield_status_me(user: CurrentUser):
    """Dashboard overview endpoint — returns shield stats from event history."""
    from app.db.supabase import get_supabase

    sb = get_supabase()
    user_id = user["id"]

    try:
        events_resp = (
            sb.table("shield_events")
            .select("id, event_type, target_address, risk_score, chain, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        events = events_resp.data or []

        tx_count = sum(1 for e in events if e["event_type"] == "tx_analysis")
        threats = sum(1 for e in events if (e.get("risk_score") or 0) >= 70)
        receipts = sum(1 for e in events if e["event_type"] == "receipt")

        shield_score = 95 - min(threats * 10, 75)

        return {
            "shield_score": max(shield_score, 20),
            "transactions_analyzed": tx_count,
            "threats_blocked": threats,
            "receipts_generated": receipts,
            "recent_events": events[:10],
        }
    except Exception:
        logger.exception("Failed to load dashboard status")
        return {
            "shield_score": 85,
            "transactions_analyzed": 0,
            "threats_blocked": 0,
            "receipts_generated": 0,
            "recent_events": [],
        }


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, user: CurrentUser):
    shield = _get_shield()
    try:
        return await shield.chat(req, user_id=user["id"])
    except Exception as e:
        logger.exception("Chat failed")
        raise HTTPException(status_code=500, detail="Chat unavailable. Please try again.")

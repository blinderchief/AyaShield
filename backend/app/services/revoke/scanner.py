"""Approval scanner and batch revoke transaction generator."""

import logging

from eth_abi import encode

from app.services.chains.abi_database import lookup_contract
from app.services.chains.evm import EVMProvider
from app.services.security.risk_scoring import calculate_risk
from app.services.security.scam_database import is_known_scam

logger = logging.getLogger(__name__)

# approve(address,uint256) selector
APPROVE_SELECTOR = "0x095ea7b3"


class ApprovalScanner:
    def __init__(self):
        self.evm = EVMProvider()

    async def scan_and_revoke(
        self, wallet_address: str, chain: str = "ethereum", risk_threshold: int = 50
    ) -> dict:
        try:
            approvals = await self.evm.scan_approval_logs(wallet_address)
        except Exception:
            logger.exception("Approval scan failed for %s", wallet_address)
            approvals = []

        # Score each approval
        scored = []
        for approval in approvals:
            token = approval["token_address"]
            spender = approval["spender"]
            token_info = lookup_contract(token)
            spender_info = lookup_contract(spender)

            signals = {
                "is_known_scam": is_known_scam(spender),
                "unlimited_approval": approval["is_unlimited"],
                "trusted_contract": bool(spender_info and spender_info.get("trusted")),
                "verified_contract": bool(spender_info),
            }
            risk = calculate_risk(signals)

            scored.append({
                "token_address": token,
                "token_name": token_info["name"] if token_info else "Unknown Token",
                "spender": spender,
                "spender_name": spender_info["name"] if spender_info else None,
                "amount": approval["amount"],
                "is_unlimited": approval["is_unlimited"],
                "risk_score": risk,
            })

        # Sort by risk (highest first)
        scored.sort(key=lambda a: a["risk_score"], reverse=True)
        risky = [a for a in scored if a["risk_score"] >= risk_threshold]

        # Generate revoke transactions
        revoke_txs = []
        for a in risky:
            tx = self._generate_revoke_tx(a["token_address"], a["spender"])
            revoke_txs.append({
                "to": a["token_address"],
                "data": tx,
                "description": f"Revoke {a['spender_name'] or a['spender'][:10]}… from {a['token_name']}",
            })

        # Estimate total at risk (simplified — would need token prices in production)
        total_at_risk = f"${len(risky) * 1000:,.0f}" if risky else "$0"

        return {
            "total_approvals": len(scored),
            "risky_approvals": len(risky),
            "total_at_risk_usd": total_at_risk,
            "approvals": scored,
            "revoke_txs": revoke_txs,
        }

    def _generate_revoke_tx(self, token_address: str, spender: str) -> str:
        """Generate approve(spender, 0) calldata."""
        spender_clean = bytes.fromhex(spender.replace("0x", "").zfill(40))
        encoded = encode(["address", "uint256"], [spender, 0])
        return APPROVE_SELECTOR + encoded.hex()

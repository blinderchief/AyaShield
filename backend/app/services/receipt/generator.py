"""Receipt generator — fetches on-chain data and builds social cards."""

import logging
import time

from app.config import get_settings
from app.services.chains.abi_database import lookup_event
from app.services.chains.evm import EVMProvider
from app.services.receipt.svg_template import build_receipt_card

logger = logging.getLogger(__name__)
settings = get_settings()


class ReceiptGenerator:
    def __init__(self):
        self.evm = EVMProvider()

    async def generate(self, tx_hash: str, chain: str = "ethereum") -> dict:
        try:
            tx = await self.evm.get_transaction(tx_hash)
            receipt = await self.evm.get_receipt(tx_hash)

            if not tx or not receipt:
                return self._mock_receipt(tx_hash, chain)

            block = None
            if tx.block_number:
                block = await self.evm.get_block(tx.block_number)

            events = self._decode_logs(receipt.get("logs", []))
            cost = self._calculate_costs(tx, receipt)
            action = self._build_action_summary(events, tx)

            timestamp = ""
            if block and block.get("timestamp"):
                ts = int(block["timestamp"], 16) if isinstance(block["timestamp"], str) else block["timestamp"]
                timestamp = time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime(ts))

            card_data = {
                "chain": chain,
                "tx_hash": tx_hash,
                "action_summary": action,
                "events": events,
                "cost_breakdown": cost,
                "risk_score": 0,
                "timestamp": timestamp,
            }
            svg = build_receipt_card(card_data)

            return {
                "tx_hash": tx_hash,
                "chain": chain,
                "action_summary": action,
                "events": events,
                "cost_breakdown": cost,
                "svg_card": svg,
            }
        except Exception:
            logger.exception("Receipt generation failed for %s", tx_hash)
            return self._mock_receipt(tx_hash, chain)

    def _decode_logs(self, logs: list) -> list[dict]:
        events = []
        for log in logs:
            topics = log.get("topics", [])
            if not topics:
                continue
            event_info = lookup_event(topics[0])
            name = event_info["name"] if event_info else "Unknown Event"
            events.append({
                "name": name,
                "address": log.get("address", ""),
                "topics": topics,
                "data": log.get("data", "0x"),
            })
        return events

    def _calculate_costs(self, tx, receipt: dict) -> dict:
        gas_used = int(receipt.get("gasUsed", "0x0"), 16) if isinstance(receipt.get("gasUsed"), str) else receipt.get("gasUsed", 0)
        gas_price = tx.gas_price if tx else 0
        gas_cost_wei = gas_used * gas_price
        gas_cost_eth = gas_cost_wei / 1e18

        value_wei = int(tx.value) if tx else 0
        value_eth = value_wei / 1e18

        # Use a reasonable ETH price — in production, fetch from oracle
        eth_price = float(getattr(settings, "eth_price_usd", None) or 3500)

        return {
            "gas_eth": f"{gas_cost_eth:.6f}",
            "gas_usd": f"${gas_cost_eth * eth_price:.2f}",
            "value_eth": f"{value_eth:.6f}",
            "value_usd": f"${value_eth * eth_price:.2f}",
            "total_eth": f"{(gas_cost_eth + value_eth):.6f}",
            "total_usd": f"${(gas_cost_eth + value_eth) * eth_price:.2f}",
        }

    def _build_action_summary(self, events: list[dict], tx) -> str:
        has_swap = any(e["name"] == "Swap" for e in events)
        transfers = [e for e in events if e["name"] == "Transfer"]

        if has_swap and len(transfers) >= 2:
            return "Token Swap"
        if any(e["name"] == "Approval" for e in events):
            return "Token Approval"
        if len(transfers) == 1:
            return "Token Transfer"
        if len(transfers) > 1:
            return f"Multi-Transfer ({len(transfers)} transfers)"

        value = int(tx.value) / 1e18 if tx else 0
        if value > 0:
            return f"ETH Transfer ({value:.4f} ETH)"
        return "Contract Interaction"

    def _mock_receipt(self, tx_hash: str, chain: str) -> dict:
        return {
            "tx_hash": tx_hash,
            "chain": chain,
            "action_summary": "Transaction",
            "events": [],
            "cost_breakdown": {
                "gas_eth": "0.000000",
                "gas_usd": "$0.00",
                "value_eth": "0.000000",
                "value_usd": "$0.00",
                "total_eth": "0.000000",
                "total_usd": "$0.00",
            },
            "svg_card": "",
        }

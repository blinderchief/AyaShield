"""Contract analyzer — combines chain data, scam DB, and risk scoring."""

import logging

from app.services.chains.abi_database import UNLIMITED_THRESHOLD, lookup_contract, lookup_selector
from app.services.chains.base import ContractMetadata
from app.services.chains.evm import EVMProvider
from app.services.security.risk_scoring import (
    calculate_risk,
    calculate_trust,
    get_risk_color,
    get_risk_level,
    get_trust_color,
    get_trust_level,
)
from app.services.security.scam_database import (
    analyze_bytecode,
    get_red_flags,
    is_known_scam,
)

logger = logging.getLogger(__name__)


class ContractAnalyzer:
    def __init__(self):
        self.evm = EVMProvider()

    async def analyze(self, address: str, chain: str = "ethereum") -> dict:
        address = address.lower()

        # Fast path: known trusted contracts
        known = lookup_contract(address)
        if known:
            return {
                "address": address,
                "chain": chain,
                "trust_score": 95,
                "trust_level": "highly_trusted",
                "trust_color": get_trust_color(95),
                "contract_name": known["name"],
                "contract_type": known["type"],
                "is_verified": True,
                "is_known_scam": False,
                "red_flags": [],
            }

        # Fast path: known scam
        if is_known_scam(address):
            return {
                "address": address,
                "chain": chain,
                "trust_score": 0,
                "trust_level": "dangerous",
                "trust_color": get_trust_color(0),
                "contract_name": None,
                "contract_type": None,
                "is_verified": False,
                "is_known_scam": True,
                "red_flags": [{"severity": "critical", "message": "Known scam/phishing address"}],
            }

        # Full analysis
        meta = await self.evm.get_contract_metadata(address)
        bytecode_analysis = analyze_bytecode(meta.bytecode)

        signals = {
            "is_known_scam": False,
            "trusted_contract": False,
            "verified_contract": meta.is_verified,
            "unverified_contract": meta.has_code and not meta.is_verified,
            "contract_age_days": meta.age_days,
            "tx_count": meta.tx_count,
            "has_selfdestruct": bytecode_analysis["has_selfdestruct"],
            "has_delegatecall": bytecode_analysis["has_delegatecall"],
        }

        trust_score = calculate_trust(signals)
        trust_level = get_trust_level(trust_score)

        contract_type = None
        if meta.contract_name:
            contract_type = self._infer_type(meta.contract_name, meta.source_code or "")

        return {
            "address": address,
            "chain": chain,
            "trust_score": trust_score,
            "trust_level": trust_level,
            "trust_color": get_trust_color(trust_score),
            "contract_name": meta.contract_name,
            "contract_type": contract_type,
            "is_verified": meta.is_verified,
            "is_known_scam": False,
            "age_days": meta.age_days,
            "tx_count": meta.tx_count,
            "red_flags": get_red_flags(signals),
        }

    def _infer_type(self, name: str, source: str) -> str:
        combined = (name + " " + source[:500]).lower()
        if any(k in combined for k in ("swap", "router", "exchange", "dex")):
            return "DEX"
        if any(k in combined for k in ("lend", "borrow", "aave", "compound")):
            return "Lending"
        if any(k in combined for k in ("nft", "erc721", "erc1155", "collectible")):
            return "NFT"
        if any(k in combined for k in ("token", "erc20", "coin")):
            return "Token"
        if any(k in combined for k in ("bridge", "relay")):
            return "Bridge"
        if any(k in combined for k in ("stake", "staking", "validator")):
            return "Staking"
        return "Smart Contract"


class TransactionAnalyzer:
    """Decode and analyze individual transactions."""

    def __init__(self):
        self.evm = EVMProvider()

    async def analyze(self, tx_hash: str | None, to: str | None, data: str | None,
                       value: str | None, chain: str = "ethereum") -> dict:
        tx_data = None
        if tx_hash:
            tx_data = await self.evm.get_transaction(tx_hash)

        _to = tx_data.to if tx_data else to
        _data = tx_data.data if tx_data else (data or "0x")
        _value = tx_data.value if tx_data else (value or "0")

        # Decode function
        fn_info = self._decode_function(_data, _to)

        # Simulate
        simulation = None
        if _to and _data:
            sim = await self.evm.simulate_transaction(
                _to, _data, _value,
                from_address=tx_data.from_address if tx_data else None,
            )
            simulation = {"success": sim.success, "gas_used": sim.gas_used, "error": sim.error}

        # Look up destination
        dest_info = lookup_contract(_to) if _to else None
        scam_dest = is_known_scam(_to) if _to else False

        # Build signals
        signals = {
            "is_known_scam": scam_dest,
            "trusted_contract": bool(dest_info and dest_info.get("trusted")),
            "unlimited_approval": fn_info.get("is_unlimited_approval", False),
            "set_approval_for_all": fn_info.get("name") == "setApprovalForAll",
            "function_risk": fn_info.get("risk", "medium"),
            "unknown_function": fn_info.get("name") == "Unknown Function",
        }

        risk_score = calculate_risk(signals)
        warnings = self._detect_warnings(signals, fn_info, _to, _value)

        return {
            "risk_score": risk_score,
            "risk_level": get_risk_level(risk_score),
            "risk_color": get_risk_color(risk_score),
            "function_name": fn_info.get("name", "Unknown"),
            "function_type": fn_info.get("type", "Unknown"),
            "decoded_params": fn_info.get("params"),
            "simulation": simulation,
            "warnings": warnings,
            "destination_info": dest_info,
        }

    def _decode_function(self, data: str, to: str | None) -> dict:
        if not data or data in ("0x", "0x0", "0x00"):
            return {"name": "Native Transfer", "type": "Transfer", "risk": "low"}

        selector = data[:10].lower()
        sig = lookup_selector(selector)
        if not sig:
            return {"name": "Unknown Function", "type": "Unknown", "risk": "medium", "selector": selector}

        result = dict(sig)

        # Detect unlimited approvals
        if sig["name"] == "approve" and len(data) >= 138:
            try:
                amount = int(data[74:138], 16)
                result["is_unlimited_approval"] = amount > UNLIMITED_THRESHOLD
                result["params"] = {"spender": "0x" + data[34:74][-40:], "amount": str(amount)}
            except (ValueError, IndexError):
                pass

        return result

    def _detect_warnings(self, signals: dict, fn_info: dict, to: str | None, value: str | None) -> list[dict]:
        warnings = []
        if signals["is_known_scam"]:
            warnings.append({"level": "critical", "message": "Destination is a known scam address!"})
        if signals["unlimited_approval"]:
            warnings.append({"level": "critical", "message": "This grants UNLIMITED token spending to the spender."})
        if signals["set_approval_for_all"]:
            warnings.append({"level": "high", "message": "This approves ALL NFTs in this collection."})
        if signals["unknown_function"]:
            warnings.append({"level": "medium", "message": "Unknown function call — cannot determine intent."})

        # High-value ETH transfer
        if value:
            try:
                val_eth = int(value) / 1e18
                if val_eth > 10:
                    warnings.append({"level": "medium", "message": f"High-value transfer: {val_eth:.4f} ETH"})
            except (ValueError, TypeError):
                pass

        return warnings

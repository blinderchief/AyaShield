"""Scam database — known addresses, patterns, and bytecode analysis."""

import logging

logger = logging.getLogger(__name__)

# Known scam/dangerous addresses (lowercase)
KNOWN_SCAM_ADDRESSES: set[str] = {
    "0x0000000000000000000000000000000000000000",
    "0x000000000000000000000000000000000000dead",
    "0xbad00000000000000000000000000000000bad01",
    "0xbad00000000000000000000000000000000bad02",
    "0xbad00000000000000000000000000000000bad03",
}

RED_FLAGS: dict[str, dict] = {
    "known_scam": {"score": 90, "severity": "critical", "message": "Address is on known scam/phishing list"},
    "unlimited_approval": {"score": 30, "severity": "high", "message": "Requesting unlimited token spending approval"},
    "set_approval_for_all": {"score": 25, "severity": "high", "message": "Requesting approval for entire NFT collection"},
    "unverified_contract": {"score": 20, "severity": "medium", "message": "Contract source code is not verified"},
    "new_contract": {"score": 15, "severity": "medium", "message": "Contract deployed less than 7 days ago"},
    "very_new_contract": {"score": 20, "severity": "high", "message": "Contract deployed less than 24 hours ago"},
    "low_activity": {"score": 15, "severity": "medium", "message": "Very few transactions with this contract"},
    "selfdestruct": {"score": 20, "severity": "high", "message": "Contract contains self-destruct capability"},
    "delegatecall": {"score": 15, "severity": "medium", "message": "Contract uses delegatecall (upgradeable/proxy)"},
    "high_value": {"score": 10, "severity": "medium", "message": "High-value transaction"},
    "unknown_function": {"score": 10, "severity": "low", "message": "Unknown function being called"},
}


def is_known_scam(address: str) -> bool:
    return address.lower() in KNOWN_SCAM_ADDRESSES


def analyze_bytecode(bytecode: str) -> dict:
    """Analyze EVM bytecode for dangerous opcodes via proper opcode walking."""
    results = {"has_selfdestruct": False, "has_delegatecall": False, "suspicious_patterns": []}
    if not bytecode or bytecode in ("0x", "0x0"):
        return results

    # Strip 0x prefix and work with raw hex
    raw = bytecode[2:] if bytecode.startswith("0x") else bytecode
    if len(raw) < 2:
        return results

    # Walk opcodes properly instead of naive substring search
    i = 0
    length = len(raw)
    while i < length - 1:
        try:
            opcode = int(raw[i : i + 2], 16)
        except ValueError:
            i += 2
            continue

        # SELFDESTRUCT (0xFF)
        if opcode == 0xFF:
            results["has_selfdestruct"] = True
            results["suspicious_patterns"].append("SELFDESTRUCT opcode found")

        # DELEGATECALL (0xF4)
        if opcode == 0xF4:
            results["has_delegatecall"] = True
            results["suspicious_patterns"].append("DELEGATECALL opcode found")

        # Skip PUSH data bytes (PUSH1=0x60 through PUSH32=0x7f)
        if 0x60 <= opcode <= 0x7F:
            push_bytes = opcode - 0x5F
            i += 2 + (push_bytes * 2)
        else:
            i += 2

    return results


def get_red_flags(signals: dict) -> list[dict]:
    """Map analysis signals to user-facing red flags."""
    flags = []
    flag_map = {
        "is_known_scam": "known_scam",
        "unlimited_approval": "unlimited_approval",
        "set_approval_for_all": "set_approval_for_all",
        "unverified_contract": "unverified_contract",
        "has_selfdestruct": "selfdestruct",
        "has_delegatecall": "delegatecall",
        "unknown_function": "unknown_function",
    }
    for signal_key, flag_key in flag_map.items():
        if signals.get(signal_key):
            flags.append(RED_FLAGS[flag_key])

    age = signals.get("contract_age_days")
    if age is not None:
        if age < 1:
            flags.append(RED_FLAGS["very_new_contract"])
        elif age < 7:
            flags.append(RED_FLAGS["new_contract"])

    if signals.get("tx_count", 0) < 10:
        flags.append(RED_FLAGS["low_activity"])

    return sorted(flags, key=lambda f: f["score"], reverse=True)

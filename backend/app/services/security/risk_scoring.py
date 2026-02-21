"""Risk scoring engine — additive signal-based scoring."""


def calculate_risk(signals: dict) -> int:
    """Calculate risk score 0-100 (higher = more dangerous)."""
    score = 0

    # Critical signals
    if signals.get("is_known_scam"):
        score += 80
    if signals.get("is_honeypot"):
        score += 70
    if signals.get("unlimited_approval"):
        score += 30
    if signals.get("set_approval_for_all"):
        score += 25

    # Contract signals
    if signals.get("unverified_contract"):
        score += 20
    if signals.get("has_selfdestruct"):
        score += 20
    if signals.get("has_delegatecall"):
        score += 15

    # Age signals
    age = signals.get("contract_age_days")
    if age is not None:
        if age < 1:
            score += 20
        elif age < 7:
            score += 10
        elif age < 30:
            score += 5

    # Activity signals
    tx_count = signals.get("tx_count", 0)
    if tx_count < 10:
        score += 15
    elif tx_count < 100:
        score += 8

    # Value signals
    value_usd = signals.get("value_usd", 0)
    if value_usd > 50_000:
        score += 10
    elif value_usd > 10_000:
        score += 5

    # Function risk
    fn_risk = signals.get("function_risk", "")
    if fn_risk == "high":
        score += 15
    elif fn_risk == "medium":
        score += 5

    # Trust discounts
    if signals.get("trusted_contract"):
        score -= 40
    if signals.get("verified_contract"):
        score -= 10
    if tx_count > 10_000:
        score -= 5

    return max(0, min(100, score))


def calculate_trust(signals: dict) -> int:
    """Calculate trust score 0-100 (higher = more trustworthy)."""
    score = 50

    if signals.get("trusted_contract"):
        score += 40
    if signals.get("verified_contract"):
        score += 15

    age = signals.get("contract_age_days")
    if age is not None:
        if age > 365:
            score += 10
        elif age < 7:
            score -= 25
        elif age < 30:
            score -= 10

    tx_count = signals.get("tx_count", 0)
    if tx_count > 10_000:
        score += 10
    elif tx_count < 10:
        score -= 20

    if signals.get("is_known_scam"):
        score -= 90
    if signals.get("unverified_contract"):
        score -= 20
    if signals.get("has_selfdestruct"):
        score -= 15

    return max(0, min(100, score))


def get_risk_level(score: int) -> str:
    if score <= 20:
        return "low"
    if score <= 50:
        return "medium"
    if score <= 75:
        return "high"
    return "critical"


def get_trust_level(score: int) -> str:
    if score >= 80:
        return "highly_trusted"
    if score >= 60:
        return "trusted"
    if score >= 40:
        return "caution"
    if score >= 20:
        return "suspicious"
    return "dangerous"


def get_risk_color(score: int) -> str:
    if score <= 20:
        return "#10B981"
    if score <= 50:
        return "#F59E0B"
    if score <= 75:
        return "#EF4444"
    return "#991B1B"


def get_trust_color(score: int) -> str:
    if score >= 80:
        return "#10B981"
    if score >= 60:
        return "#34D399"
    if score >= 40:
        return "#F59E0B"
    if score >= 20:
        return "#EF4444"
    return "#991B1B"

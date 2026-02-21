"""SVG template for Aya Shield receipt cards."""

from xml.sax.saxutils import escape


def _esc(text: str) -> str:
    return escape(str(text))


def _truncate(text: str, length: int = 30) -> str:
    return text[:length] + "…" if len(text) > length else text


def _format_hash(h: str) -> str:
    if len(h) > 16:
        return f"{h[:8]}…{h[-6:]}"
    return h


def build_receipt_card(data: dict) -> str:
    chain = _esc(data.get("chain", "ethereum").upper())
    action = _esc(_truncate(data.get("action_summary", "Transaction"), 50))
    tx_hash = _format_hash(data.get("tx_hash", ""))
    timestamp = _esc(data.get("timestamp", ""))

    cost = data.get("cost_breakdown", {})
    value_eth = _esc(cost.get("value_eth", "0"))
    gas_eth = _esc(cost.get("gas_eth", "0"))
    total_usd = _esc(cost.get("total_usd", "$0"))

    risk_score = data.get("risk_score", 0)
    risk_color = "#10B981" if risk_score <= 20 else "#F59E0B" if risk_score <= 50 else "#EF4444"

    events = data.get("events", [])
    events_y = 245
    event_lines = ""
    for i, ev in enumerate(events[:3]):
        name = _esc(_truncate(ev.get("name", "Event"), 40))
        event_lines += f'<text x="30" y="{events_y + i * 18}" fill="#94A3B8" font-size="11">{name}</text>'

    card_height = 380 + len(events[:3]) * 18

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="600" height="{card_height}" viewBox="0 0 600 {card_height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0F1E"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="600" height="{card_height}" rx="16" fill="url(#bg)"/>
  <rect x="0" y="0" width="600" height="4" rx="2" fill="url(#accent)"/>

  <!-- Header -->
  <text x="30" y="40" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="18" font-weight="700">AYA SHIELD</text>
  <rect x="520" y="22" width="55" height="24" rx="12" fill="#1E293B"/>
  <text x="548" y="39" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">{chain}</text>

  <!-- Action -->
  <text x="30" y="80" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="22" font-weight="600">{action}</text>

  <!-- Divider -->
  <line x1="30" y1="100" x2="570" y2="100" stroke="#1E293B" stroke-width="1"/>

  <!-- Cost Breakdown -->
  <text x="30" y="130" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12">Value</text>
  <text x="200" y="130" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="12">{value_eth} ETH</text>

  <text x="30" y="155" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12">Gas Fee</text>
  <text x="200" y="155" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="12">{gas_eth} ETH</text>

  <text x="30" y="185" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13" font-weight="600">Total</text>
  <text x="200" y="185" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="13" font-weight="600">{total_usd}</text>

  <!-- Risk Badge -->
  <circle cx="520" cy="155" r="35" fill="none" stroke="{risk_color}" stroke-width="3"/>
  <text x="520" y="152" fill="{risk_color}" font-family="system-ui, sans-serif" font-size="20" font-weight="700" text-anchor="middle">{risk_score}</text>
  <text x="520" y="168" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">RISK</text>

  <!-- Divider -->
  <line x1="30" y1="210" x2="570" y2="210" stroke="#1E293B" stroke-width="1"/>

  <!-- Events -->
  <text x="30" y="232" fill="#64748B" font-family="system-ui, sans-serif" font-size="11" font-weight="600">EVENTS</text>
  {event_lines}

  <!-- Footer -->
  <line x1="30" y1="{card_height - 55}" x2="570" y2="{card_height - 55}" stroke="#1E293B" stroke-width="1"/>
  <text x="30" y="{card_height - 30}" fill="#475569" font-family="system-ui, sans-serif" font-size="10">{_esc(tx_hash)}</text>
  <text x="30" y="{card_height - 15}" fill="#475569" font-family="system-ui, sans-serif" font-size="10">{timestamp}</text>
  <text x="570" y="{card_height - 15}" fill="#475569" font-family="system-ui, sans-serif" font-size="10" text-anchor="end">Powered by Aya Shield · aya.cash</text>
</svg>"""

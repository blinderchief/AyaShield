import json
import logging
import re

import google.generativeai as genai

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

try:
    genai.configure(api_key=settings.gemini_api_key)
except Exception:
    logger.warning("Gemini API key not configured — AI features will be unavailable")

INTENT_SYSTEM_PROMPT = """You are the AI brain of Aya Shield, a crypto transaction security tool.
Classify the user message into one of these categories and extract parameters.
Return ONLY valid JSON — no markdown, no explanation.

Categories:
- analyze_tx: user wants to check/analyze a transaction
- analyze_contract: user wants to check an address or contract
- receipt: user wants a receipt or social card for a transaction
- revoke: user wants to revoke approvals or trigger panic mode
- status: user wants their shield/wallet status
- general: general question about security

Output format:
{"category": "<category>", "parameters": {"address": "...", "tx_hash": "...", "chain": "..."}}

Only include parameters that are explicitly mentioned. Never fabricate addresses or hashes."""

ANALYSIS_PROMPTS = {
    "tx_analysis": (
        "You are Aya Shield, a friendly and expert crypto security AI. "
        "Explain this transaction analysis to the user in 2-3 clear sentences. "
        "Be direct about risks. If dangerous, be firm but not alarming.\n\n"
        "Analysis data: {data}"
    ),
    "contract_analysis": (
        "You are Aya Shield, a friendly crypto security AI. "
        "Summarize this contract analysis in 2-3 sentences. "
        "Highlight trust level and any red flags clearly.\n\n"
        "Analysis data: {data}"
    ),
    "receipt": (
        "You are Aya Shield. Write a brief, engaging one-line summary of this transaction "
        "suitable for sharing on social media. Keep it under 140 characters. Include an emoji.\n\n"
        "Transaction data: {data}"
    ),
    "revoke": (
        "You are Aya Shield. Summarize the approval scan results in 2-3 sentences. "
        "Be clear about how many are risky and what the user should do.\n\n"
        "Scan data: {data}"
    ),
}


class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel(settings.gemini_model)

    async def parse_intent(self, message: str) -> dict:
        """Parse user's natural language message into structured intent."""
        sanitized = message[:1000].strip()
        try:
            response = await self.model.generate_content_async(
                f"{INTENT_SYSTEM_PROMPT}\n\nUser message: {sanitized}"
            )
            text = response.text.strip()
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                return json.loads(match.group())
            return {"category": "general", "parameters": {}}
        except Exception:
            logger.exception("Gemini intent parsing failed")
            return {"category": "general", "parameters": {}}

    async def generate_explanation(self, data: dict, context: str) -> str:
        """Generate AI explanation for analysis results."""
        prompt_template = ANALYSIS_PROMPTS.get(context)
        if not prompt_template:
            return ""
        try:
            # Limit data size sent to LLM
            data_str = json.dumps(data, default=str)[:3000]
            response = await self.model.generate_content_async(
                prompt_template.format(data=data_str)
            )
            return response.text.strip()
        except Exception:
            logger.exception("Gemini explanation generation failed")
            return self._fallback_message(context)

    def _fallback_message(self, context: str) -> str:
        fallbacks = {
            "tx_analysis": "Transaction analysis complete. Review the risk score and warnings above.",
            "contract_analysis": "Contract analysis complete. Check the trust score for details.",
            "receipt": "Transaction confirmed successfully.",
            "revoke": "Approval scan complete. Review the results above.",
        }
        return fallbacks.get(context, "Analysis complete.")

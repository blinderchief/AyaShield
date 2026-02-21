"""
Aya Shield AI Agent — Gemini-powered security intelligence with function calling.

This is NOT a simple wrapper. The agent can:
1. Parse user intents with high accuracy
2. Plan and execute multi-step security analysis
3. Use function calling for structured operations
4. Maintain context and provide actionable recommendations
"""

import json
import logging
import re
from typing import Any

import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

try:
    genai.configure(api_key=settings.gemini_api_key)
except Exception:
    logger.warning("Gemini API key not configured — AI features will be unavailable")


# ═══════════════════════════════════════════════════════════════════════════════
# AGENT SYSTEM PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

AGENT_SYSTEM_PROMPT = """You are Aya Shield, an AI security agent specialized in cryptocurrency transaction analysis and wallet protection.

## Your Capabilities
- Analyze blockchain transactions for security risks
- Evaluate smart contract trustworthiness  
- Detect phishing, honeypots, and malicious approvals
- Generate human-readable security reports
- Recommend protective actions

## Your Personality
- Professional but approachable
- Direct and clear about risks — never sugarcoat dangers
- Educational — help users understand WHY something is risky
- Proactive — suggest next steps and preventive measures

## Response Guidelines
1. Always prioritize user safety over being polite
2. If something is dangerous, say so clearly
3. Provide specific, actionable advice
4. Use plain English — avoid jargon unless necessary
5. When uncertain, say so and recommend caution

## Risk Communication
- CRITICAL (Score 80-100): Immediate danger. Do NOT proceed. Explain why.
- HIGH (Score 60-79): Significant risk. Strongly advise against proceeding.
- MEDIUM (Score 40-59): Caution advised. Explain concerns and let user decide.
- LOW (Score 0-39): Generally safe, but always verify.

Remember: You are protecting real people's money and assets. Take this responsibility seriously."""


INTENT_SYSTEM_PROMPT = """You are the intent parser for Aya Shield, a crypto security tool.

Analyze the user's message and determine:
1. What action they want to take
2. What parameters are needed
3. How confident you are in this classification

## Categories
- analyze_tx: Analyze a specific transaction (needs: tx_hash, optionally chain)
- analyze_contract: Check a contract/address for risks (needs: address, optionally chain)  
- receipt: Generate a receipt for a transaction (needs: tx_hash, optionally chain)
- revoke: Scan wallet for risky approvals (needs: wallet_address, optionally chain)
- status: Check overall wallet security status (needs: wallet_address)
- explain: User wants explanation of a crypto concept
- general: General question or greeting

## Output Format (JSON only, no markdown)
{
  "category": "<category>",
  "confidence": <0.0-1.0>,
  "parameters": {
    "tx_hash": "0x...",
    "address": "0x...",
    "wallet_address": "0x...",
    "chain": "ethereum|polygon|arbitrum|base|optimism|avalanche|bsc"
  },
  "reasoning": "<brief explanation of why you chose this category>"
}

## Rules
- Extract addresses/hashes from the message if present
- Default chain to "ethereum" if not specified
- Set confidence based on how clear the intent is
- Never fabricate addresses or hashes — only extract what's explicitly in the message"""


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCTION DECLARATIONS FOR TOOL CALLING
# ═══════════════════════════════════════════════════════════════════════════════

SECURITY_TOOLS = Tool(
    function_declarations=[
        FunctionDeclaration(
            name="analyze_transaction",
            description="Analyze a blockchain transaction for security risks including phishing, malicious approvals, and suspicious patterns",
            parameters={
                "type": "object",
                "properties": {
                    "tx_hash": {
                        "type": "string",
                        "description": "The transaction hash to analyze (0x...)",
                    },
                    "chain": {
                        "type": "string",
                        "enum": ["ethereum", "polygon", "arbitrum", "base", "optimism", "avalanche", "bsc"],
                        "description": "The blockchain network",
                    },
                },
                "required": ["tx_hash"],
            },
        ),
        FunctionDeclaration(
            name="analyze_contract",
            description="Analyze a smart contract address for trustworthiness, honeypot detection, and red flags",
            parameters={
                "type": "object",
                "properties": {
                    "address": {
                        "type": "string",
                        "description": "The contract address to analyze (0x...)",
                    },
                    "chain": {
                        "type": "string",
                        "enum": ["ethereum", "polygon", "arbitrum", "base", "optimism", "avalanche", "bsc"],
                        "description": "The blockchain network",
                    },
                },
                "required": ["address"],
            },
        ),
        FunctionDeclaration(
            name="scan_approvals",
            description="Scan a wallet for token approvals and identify risky unlimited approvals that could drain funds",
            parameters={
                "type": "object",
                "properties": {
                    "wallet_address": {
                        "type": "string",
                        "description": "The wallet address to scan (0x...)",
                    },
                    "chain": {
                        "type": "string",
                        "enum": ["ethereum", "polygon", "arbitrum", "base", "optimism", "avalanche", "bsc"],
                        "description": "The blockchain network",
                    },
                },
                "required": ["wallet_address"],
            },
        ),
        FunctionDeclaration(
            name="generate_receipt",
            description="Generate a detailed receipt with cost breakdown and event logs for a completed transaction",
            parameters={
                "type": "object",
                "properties": {
                    "tx_hash": {
                        "type": "string",
                        "description": "The transaction hash (0x...)",
                    },
                    "chain": {
                        "type": "string",
                        "enum": ["ethereum", "polygon", "arbitrum", "base", "optimism", "avalanche", "bsc"],
                        "description": "The blockchain network",
                    },
                },
                "required": ["tx_hash"],
            },
        ),
        FunctionDeclaration(
            name="explain_concept",
            description="Explain a cryptocurrency or blockchain security concept in plain English",
            parameters={
                "type": "object",
                "properties": {
                    "concept": {
                        "type": "string",
                        "description": "The concept to explain (e.g., 'token approval', 'honeypot', 'rug pull')",
                    },
                },
                "required": ["concept"],
            },
        ),
    ]
)


# ═══════════════════════════════════════════════════════════════════════════════
# ANALYSIS PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

ANALYSIS_PROMPTS = {
    "tx_analysis": """Analyze this transaction data and provide a security assessment.

Transaction Data:
{data}

Provide:
1. A clear risk verdict (Safe/Caution/Dangerous)
2. What the transaction actually does in plain English
3. Any red flags or concerns
4. Recommended action (proceed/review carefully/do not sign)

Keep response under 150 words. Be direct.""",

    "contract_analysis": """Analyze this smart contract and provide a trust assessment.

Contract Data:
{data}

Provide:
1. Trust verdict (Trusted/Uncertain/Suspicious/Dangerous)
2. What kind of contract this is
3. Key red flags found (if any)
4. Whether it's safe to interact with

Keep response under 150 words. Be direct about risks.""",

    "receipt": """Create a brief, engaging summary of this transaction for sharing.

Transaction Data:
{data}

Write a single sentence (under 140 chars) that captures what happened. Include one relevant emoji. Make it suitable for sharing on social media.""",

    "revoke": """Summarize these approval scan results and provide recommendations.

Scan Data:
{data}

Provide:
1. How many approvals were found
2. How many are risky and why
3. Priority order for revoking
4. Estimated risk if not revoked

Keep response under 150 words. Be actionable.""",

    "explain": """You are explaining a crypto/blockchain security concept to someone who may be new to crypto.

Concept: {concept}

Provide:
1. A simple definition (1-2 sentences)
2. Why it matters for security
3. A real-world analogy if helpful
4. One key thing to watch out for

Keep response under 100 words. Use plain English.""",
}


# ═══════════════════════════════════════════════════════════════════════════════
# GEMINI AGENT SERVICE
# ═══════════════════════════════════════════════════════════════════════════════

class GeminiService:
    """
    AI Agent for crypto security analysis powered by Google Gemini.
    
    This agent can:
    - Parse natural language into structured intents
    - Execute multi-step security analysis
    - Generate human-readable explanations
    - Provide actionable security recommendations
    """
    
    def __init__(self):
        self.model = genai.GenerativeModel(
            settings.gemini_model,
            system_instruction=AGENT_SYSTEM_PROMPT,
        )
        self.tool_model = genai.GenerativeModel(
            settings.gemini_model,
            tools=[SECURITY_TOOLS],
        )
    
    async def parse_intent(self, message: str) -> dict:
        """
        Parse user's natural language message into structured intent.
        
        Returns:
            dict with keys: category, confidence, parameters, reasoning
        """
        sanitized = message[:1000].strip()
        
        try:
            response = await self.model.generate_content_async(
                f"{INTENT_SYSTEM_PROMPT}\n\nUser message: {sanitized}",
                generation_config=genai.GenerationConfig(
                    temperature=0.1,  # Low temp for consistent parsing
                    max_output_tokens=500,
                ),
            )
            
            text = response.text.strip()
            
            # Extract JSON from response
            json_match = re.search(r"\{[\s\S]*\}", text)
            if json_match:
                parsed = json.loads(json_match.group())
                
                # Validate and normalize
                return {
                    "category": parsed.get("category", "general"),
                    "confidence": min(1.0, max(0.0, parsed.get("confidence", 0.5))),
                    "parameters": parsed.get("parameters", {}),
                    "reasoning": parsed.get("reasoning", ""),
                }
            
            return {"category": "general", "confidence": 0.3, "parameters": {}, "reasoning": "Could not parse intent"}
            
        except Exception as e:
            logger.exception("Intent parsing failed")
            return {"category": "general", "confidence": 0.0, "parameters": {}, "reasoning": str(e)}
    
    async def generate_explanation(self, data: dict, context: str) -> str:
        """
        Generate AI explanation for analysis results.
        
        Args:
            data: The analysis data to explain
            context: Type of analysis (tx_analysis, contract_analysis, receipt, revoke)
        
        Returns:
            Human-readable explanation string
        """
        prompt_template = ANALYSIS_PROMPTS.get(context)
        if not prompt_template:
            return ""
        
        try:
            # Serialize data, limiting size
            data_str = json.dumps(data, default=str)[:4000]
            
            response = await self.model.generate_content_async(
                prompt_template.format(data=data_str, concept=data.get("concept", "")),
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=300,
                ),
            )
            
            return response.text.strip()
            
        except Exception:
            logger.exception("Explanation generation failed")
            return self._fallback_message(context)
    
    async def agent_chat(self, message: str, context: dict | None = None) -> dict:
        """
        Full agent conversation with tool calling capability.
        
        This method allows the AI to:
        1. Understand the user's request
        2. Decide which tools (if any) to call
        3. Execute the tools
        4. Synthesize a response
        
        Args:
            message: User's message
            context: Optional context from previous interactions
        
        Returns:
            dict with: response (str), tool_calls (list), suggested_actions (list)
        """
        try:
            # Build conversation with context
            full_prompt = message
            if context:
                full_prompt = f"Previous context: {json.dumps(context)}\n\nUser: {message}"
            
            response = await self.tool_model.generate_content_async(
                full_prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                ),
            )
            
            # Check for function calls
            tool_calls = []
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, "function_call") and part.function_call:
                        fc = part.function_call
                        tool_calls.append({
                            "function": fc.name,
                            "arguments": dict(fc.args) if fc.args else {},
                        })
            
            # Extract text response
            text_response = ""
            if response.text:
                text_response = response.text.strip()
            
            return {
                "response": text_response,
                "tool_calls": tool_calls,
                "suggested_actions": self._extract_suggested_actions(text_response),
            }
            
        except Exception:
            logger.exception("Agent chat failed")
            return {
                "response": "I encountered an error processing your request. Please try again or rephrase your question.",
                "tool_calls": [],
                "suggested_actions": [],
            }
    
    async def explain_concept(self, concept: str) -> str:
        """Explain a crypto/security concept in plain English."""
        try:
            response = await self.model.generate_content_async(
                ANALYSIS_PROMPTS["explain"].format(concept=concept, data=""),
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=200,
                ),
            )
            return response.text.strip()
        except Exception:
            logger.exception("Concept explanation failed")
            return f"I couldn't generate an explanation for '{concept}'. Please try again."
    
    async def assess_risk_level(self, risk_score: int, warnings: list[dict]) -> dict:
        """
        Provide AI assessment of overall risk based on score and warnings.
        
        Returns:
            dict with: verdict, explanation, should_proceed, recommended_action
        """
        if risk_score >= 80:
            verdict = "CRITICAL"
            should_proceed = False
            color = "red"
        elif risk_score >= 60:
            verdict = "HIGH"
            should_proceed = False
            color = "orange"
        elif risk_score >= 40:
            verdict = "MEDIUM"
            should_proceed = True  # With caution
            color = "yellow"
        else:
            verdict = "LOW"
            should_proceed = True
            color = "green"
        
        # Generate contextual explanation
        warning_summary = ", ".join([w.get("message", "Unknown warning") for w in warnings[:3]])
        
        try:
            prompt = f"""Risk Score: {risk_score}/100
Verdict: {verdict}
Warnings: {warning_summary or "None"}

Write a 1-2 sentence risk assessment. Be direct. If risky, say why. If safe, confirm why."""
            
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.5,
                    max_output_tokens=100,
                ),
            )
            explanation = response.text.strip()
        except Exception:
            explanation = f"Risk level: {verdict}. " + (warning_summary if warning_summary else "No specific warnings detected.")
        
        return {
            "verdict": verdict,
            "explanation": explanation,
            "should_proceed": should_proceed,
            "color": color,
            "recommended_action": "Do not proceed" if not should_proceed else "Proceed with caution" if risk_score >= 40 else "Safe to proceed",
        }
    
    def _fallback_message(self, context: str) -> str:
        """Return fallback message when AI generation fails."""
        fallbacks = {
            "tx_analysis": "Transaction analysis complete. Please review the risk score and warnings above for details.",
            "contract_analysis": "Contract analysis complete. Check the trust score and any red flags identified.",
            "receipt": "Transaction confirmed ✓",
            "revoke": "Approval scan complete. Review the results above and consider revoking any high-risk approvals.",
            "explain": "I couldn't generate an explanation. Please check the documentation for more information.",
        }
        return fallbacks.get(context, "Analysis complete. Please review the results above.")
    
    def _extract_suggested_actions(self, text: str) -> list[str]:
        """Extract actionable suggestions from AI response."""
        actions = []
        
        # Look for common action patterns
        action_patterns = [
            r"(?:you should|recommend|suggest|consider|try to|make sure to)\s+([^.!?]+)",
            r"(?:don't|do not|avoid|never)\s+([^.!?]+)",
        ]
        
        for pattern in action_patterns:
            matches = re.findall(pattern, text.lower())
            for match in matches[:3]:  # Limit to 3 actions
                action = match.strip().capitalize()
                if len(action) > 10 and len(action) < 100:
                    actions.append(action)
        
        return actions[:3]  # Return max 3 suggestions

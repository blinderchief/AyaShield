import logging

from supabase import Client, create_client

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_client: Client | None = None


def init_supabase() -> Client:
    global _client
    _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    logger.info("Supabase client initialized")
    return _client


def get_supabase() -> Client:
    if _client is None:
        return init_supabase()
    return _client


async def log_shield_event(
    user_id: str,
    event_type: str,
    chain: str,
    *,
    target_address: str | None = None,
    tx_hash: str | None = None,
    risk_score: int | None = None,
    trust_score: int | None = None,
    result: dict | None = None,
) -> None:
    """Persist a shield analysis event."""
    try:
        get_supabase().table("shield_events").insert(
            {
                "user_id": user_id,
                "event_type": event_type,
                "chain": chain,
                "target_address": target_address,
                "tx_hash": tx_hash,
                "risk_score": risk_score,
                "trust_score": trust_score,
                "result": result,
            }
        ).execute()
    except Exception:
        logger.exception("Failed to log shield event")

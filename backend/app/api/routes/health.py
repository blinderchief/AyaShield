import logging

from fastapi import APIRouter

from app.config import get_settings
from app.db.supabase import get_supabase

router = APIRouter(tags=["health"])
logger = logging.getLogger(__name__)
settings = get_settings()


@router.get("/health")
async def health_check():
    checks = {"api": "ok", "version": "1.0.0", "env": settings.app_env}

    # Supabase connectivity
    try:
        get_supabase().table("profiles").select("id").limit(1).execute()
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "error"

    # Gemini availability
    checks["ai"] = "ok" if settings.gemini_api_key else "not_configured"
    checks["blockchain"] = "ok" if settings.eth_provider_url else "not_configured"

    overall = "healthy" if all(v == "ok" for k, v in checks.items() if k not in ("version", "env")) else "degraded"
    return {"status": overall, "checks": checks}

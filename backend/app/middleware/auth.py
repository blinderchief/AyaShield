import logging
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.db.supabase import get_supabase

logger = logging.getLogger(__name__)


def _extract_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_header[7:]


async def get_current_user(request: Request) -> dict:
    """Verify Supabase JWT by calling Supabase auth.get_user()."""
    token = _extract_token(request)
    try:
        sb = get_supabase()
        user_resp = sb.auth.get_user(token)
        user = user_resp.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user found",
            )
        return {
            "id": user.id,
            "email": user.email,
            "role": user.role or "authenticated",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("JWT verification failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


CurrentUser = Annotated[dict, Depends(get_current_user)]

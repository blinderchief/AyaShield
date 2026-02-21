import logging
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

SUPABASE_JWT_SECRET = settings.supabase_jwt_secret or settings.supabase_anon_key
ALGORITHM = "HS256"


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
    """Verify Supabase JWT and return user payload."""
    token = _extract_token(request)
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject",
            )
        return {
            "id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated"),
        }
    except JWTError as e:
        logger.warning("JWT verification failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


CurrentUser = Annotated[dict, Depends(get_current_user)]

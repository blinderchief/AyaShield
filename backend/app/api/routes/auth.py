import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.db.supabase import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict


class WalletLinkRequest(BaseModel):
    wallet_address: str


@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignUpRequest):
    sb = get_supabase()
    try:
        result = sb.auth.sign_up(
            {
                "email": req.email,
                "password": req.password,
                "options": {"data": {"display_name": req.display_name}},
            }
        )
        if not result.session:
            raise HTTPException(status_code=400, detail="Signup failed — check email for confirmation.")
        return AuthResponse(
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token,
            user={"id": result.user.id, "email": result.user.email},
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Signup error")
        raise HTTPException(status_code=400, detail="Signup failed. Email may already be registered.")


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    sb = get_supabase()
    try:
        result = sb.auth.sign_in_with_password(
            {"email": req.email, "password": req.password}
        )
        return AuthResponse(
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token,
            user={"id": result.user.id, "email": result.user.email},
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password.")


@router.post("/refresh", response_model=AuthResponse)
async def refresh(refresh_token: str):
    sb = get_supabase()
    try:
        result = sb.auth.refresh_session(refresh_token)
        return AuthResponse(
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token,
            user={"id": result.user.id, "email": result.user.email},
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token.")

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


class SignUpResponse(BaseModel):
    message: str
    requires_confirmation: bool
    user: dict | None = None
    access_token: str | None = None
    refresh_token: str | None = None


class ResendConfirmationRequest(BaseModel):
    email: EmailStr


class WalletLinkRequest(BaseModel):
    wallet_address: str


@router.post("/signup", response_model=SignUpResponse)
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
        
        # Check if email confirmation is required
        if result.session:
            # Session exists = email confirmation disabled, user can proceed
            return SignUpResponse(
                message="Account created successfully",
                requires_confirmation=False,
                user={"id": result.user.id, "email": result.user.email},
                access_token=result.session.access_token,
                refresh_token=result.session.refresh_token,
            )
        elif result.user:
            # User exists but no session = email confirmation required
            return SignUpResponse(
                message="Confirmation email sent. Please check your inbox.",
                requires_confirmation=True,
                user={"id": result.user.id, "email": result.user.email},
            )
        else:
            raise HTTPException(status_code=400, detail="Signup failed.")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Signup error")
        error_msg = str(e)
        if "already registered" in error_msg.lower() or "already exists" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")
        raise HTTPException(status_code=400, detail="Signup failed. Please try again.")


@router.post("/resend-confirmation")
async def resend_confirmation(req: ResendConfirmationRequest):
    sb = get_supabase()
    try:
        sb.auth.resend(type="signup", email=req.email)
        return {"message": "Confirmation email resent. Please check your inbox."}
    except Exception:
        logger.exception("Resend confirmation error")
        raise HTTPException(status_code=400, detail="Failed to resend confirmation email.")


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

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from backend.core.database import get_db
from backend.services.auth_service import AuthService
from backend.schemas.user_schema import UserLogin, UserResponse, UserCreate
from backend.schemas.auth_schema import TokenResponse, TokenRefresh
from backend.core.logging import get_logger
from backend.middlewares.auth_middleware import get_current_user
from backend.services.user_service import UserService

log = get_logger()


router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
)
async def register_user(
    user_in: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]
):
    """Register a new user"""
    log.info("Router: Registering new user: {}", user_in.number)
    user_service = UserService(db)
    return await user_service.register_user(user_in)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
)
async def login_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Login user with phone number and password"""
    user_login = UserLogin(number=form_data.username, password=form_data.password)
    log.info("Router: Login attempt for user: {}", user_login.number)
    auth_service = AuthService(db)
    return await auth_service.login_user(user_login)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh Access Token",
)
async def refresh_access_token(
    token_data: TokenRefresh, db: Annotated[AsyncSession, Depends(get_db)]
):
    """Refresh access token with refresh token"""
    log.info("Router: Refresh attempt for token: {}", token_data.refresh_token)
    auth_service = AuthService(db)
    return await auth_service.refresh_access_token(token_data.refresh_token)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User",
)
async def get_current_user(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get current user"""
    log.info("Router: Get current user: {}", current_user.number)
    auth_service = AuthService(db)
    return await auth_service.get_user_by_id(current_user.id)

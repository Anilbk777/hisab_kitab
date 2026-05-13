from fastapi import Depends, status, HTTPException
from typing import Annotated
from backend.security import SecurityService
from backend.models.model import User
from backend.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from backend.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordBearer
from backend.schemas.user_schema import UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    user_id = SecurityService().verify_access_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    auth_service = AuthService(db)
    return await auth_service.get_user_by_id(user_id)

CurrentUser = Annotated[UserResponse, Depends(get_current_user)]
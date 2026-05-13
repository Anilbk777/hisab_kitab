from datetime import UTC, timedelta, datetime
import jwt
from pwdlib import PasswordHash

from backend.core.config import settings
from backend.models.model import User
from backend.core.database import get_db
from typing import Annotated    



class SecurityService:
    def __init__(self):
        self.password_hasher = PasswordHash.recommended()

    def hash_password(self, password: str) -> str:
        return self.password_hasher.hash(password)

    def verify_password(self, password: str, hashed_password: str) -> bool:
        return self.password_hasher.verify(password, hashed_password)

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode.update({"exp": expire})
        return jwt.encode(
            to_encode,
            settings.JWT_SECRET.get_secret_value(),
            algorithm=settings.JWT_ALGORITHM,
        )

    def verify_access_token(self, token: str) -> str | None:
        """Verify a JWT access token and return the subject (user id) if valid."""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET.get_secret_value(),
                algorithms=[settings.JWT_ALGORITHM],
                options={"require": ["exp", "sub"]},
            )
        except jwt.InvalidTokenError:
            return None
        else:
            return payload.get("sub")

    def create_refresh_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire})
        return jwt.encode(
            to_encode,
            settings.JWT_SECRET.get_secret_value(),
            algorithm=settings.JWT_ALGORITHM,
        )

    def verify_refresh_token(self, token: str) -> str | None:
        """Verify a JWT refresh token and return the subject (user id) if valid."""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET.get_secret_value(),
                algorithms=[settings.JWT_ALGORITHM],
                options={"require": ["exp", "sub"]},
            )
        except jwt.InvalidTokenError:
            return None
        else:
            return payload.get("sub")


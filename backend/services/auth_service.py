from backend.core.logging import log
from backend.repositories.user_repo import UserRepository
from backend.core.exceptions import AuthenticationError
from backend.security import SecurityService
from sqlalchemy.ext.asyncio import AsyncSession
from backend.schemas.auth_schema import TokenResponse
from backend.schemas.user_schema import UserLogin, UserResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)
        self.security_service = SecurityService()

    async def login_user(self, login_data: UserLogin) -> TokenResponse:
        """Business logic for user login"""
        log.info("Service: Login attempt for user: {}", login_data.number)

        user = await self.repository.get_by_number(login_data.number)
        if not user:
            raise AuthenticationError("Invalid credentials")

        is_valid_password = self.security_service.verify_password(
            login_data.password, user.hashed_password
        )

        if not is_valid_password:
            raise AuthenticationError("Invalid credentials")
        access_token = self.security_service.create_access_token({"sub": str(user.id)})
        refresh_token = self.security_service.create_refresh_token(
            {"sub": str(user.id)}
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def get_user_by_id(self, user_id: str) -> UserResponse:
        """Business logic for getting current user"""
        log.info("Service: Get current user")
        try:
            if not user_id:
                raise AuthenticationError("Invalid user id provided")
            user = await self.repository.get_by_id(int(user_id))
            if not user:
                raise AuthenticationError("Invalid user")
            return user
        except Exception as e:
            log.error("Service: Error getting current user: {}", e)
            raise AuthenticationError("Invalid user")

    async def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """Business logic for refreshing access token"""
        log.info("Service: Refresh access token")
        user_id = self.security_service.verify_refresh_token(refresh_token)
        if not user_id:
            raise AuthenticationError("Invalid refresh token")
        access_token = self.security_service.create_access_token({"sub": str(user_id)})
        new_refresh_token = self.security_service.create_refresh_token(
            {"sub": str(user_id)}
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
        )

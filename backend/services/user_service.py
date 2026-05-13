from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from backend.repositories.user_repo import UserRepository
from backend.schemas.user_schema import UserCreate, UserUpdate
from backend.models.model import User
from backend.core.exceptions import NotFoundError, DuplicateError
from backend.core.logging import log
from backend.security import SecurityService


class UserService:
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)
        self.security_service = SecurityService()

    async def register_user(self, user_in: UserCreate) -> User:
        """Business logic for user registration"""
        log.info("Service: Registering new user: {}", user_in.number)
        
        # Check if user already exists
        existing = await self.repository.get_by_number(user_in.number)
        if existing:
            log.warning("Service: User with number {} already exists", user_in.number)
            raise DuplicateError("User", user_in.number)

        user_data = {
            "user_name": user_in.user_name,
            "number": user_in.number,
            "hashed_password": self.security_service.hash_password(user_in.password),  
        }
        
        return await self.repository.create(user_data)

 

    async def get_all_users(self) -> List[User]:
        """Business logic for fetching all users"""
        return await self.repository.get_all()

    async def get_user_by_id(self, user_id: int) -> User:
        """Business logic for fetching a single user"""
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)
        return user

    async def get_user_by_number(self, number: str) -> User:
        """Business logic for fetching a user by number"""
        user = await self.repository.get_by_number(number)
        if not user:
            raise NotFoundError("User", number)
        return user

    async def delete_user(self, user_id: int) -> None:
        """Business logic for deleting a user"""
        user = await self.get_user_by_id(user_id)
        await self.repository.delete(user)

    async def update_user(self, user_id: int, user_update: UserUpdate) -> User:
        """Business logic for updating a user"""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)
        return await self.repository.update(user, user_update.model_dump(exclude_unset=True))
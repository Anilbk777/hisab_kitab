from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, List

from backend.models.model import User
from backend.core.logging import log
from backend.core.exceptions import DatabaseError


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_data: dict) -> User:
        """Create a new User"""
        try:
            db_user = User(**user_data)
            self.db.add(db_user)
            await self.db.commit()
            await self.db.refresh(db_user)
            return db_user
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error creating user: {}", str(e))
            raise DatabaseError("Failed to create user in database.")

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        try:
            result = await self.db.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error("Database error fetching user ID {}: {}", user_id, e)
            raise DatabaseError("Failed to fetch user from database.")

    async def get_by_number(self, number: str) -> Optional[User]:
        """Get user by phone number"""
        try:
            result = await self.db.execute(
                select(User).where(User.number == number)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error("Database error fetching user by number: {}", str(e))
            raise DatabaseError("Failed to fetch user by number from database.")

    async def get_all(self) -> List[User]:
        """Get all users"""
        try:
            result = await self.db.execute(select(User))
            return list(result.scalars().all())
        except SQLAlchemyError as e:
            log.error("Database error fetching all users: {}", str(e))
            raise DatabaseError("Failed to fetch users from database.")

    async def update(self, user:User, update_data: dict) -> User:
        """Update an existing user"""
        try:
            for field, value in update_data.items():
                setattr(user, field, value)
            await self.db.commit()
            await self.db.refresh(user)
            return user
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error updating user {}: {}", user.id, str(e))
            raise DatabaseError("Failed to update user in database.")

    async def delete(self, user: User) -> None:
        """Delete user"""
        try:
            await self.db.delete(user)
            await self.db.commit()
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error deleting user {}: {}", user.id, e)
            raise DatabaseError("Failed to delete user from database.")
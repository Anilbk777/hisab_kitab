from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from backend.models.model import User
from backend.schemas.user_schema import UserCreate
from typing import Optional, List
from fastapi import HTTPException, status
from backend.core.logging import get_logger

log = get_logger()

class UserRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[User]:
        """Get all users"""
        log.info("Getting all users")
        try:
            result = await self.db.execute(select(User))
            log.info("All users retrieved successfully")
            return result.scalars().all()
        except SQLAlchemyError as e:
            log.error(f" (SQLAlchemyError): {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

    async def create(self, user_in: UserCreate) -> User:
        log.info("Creating new user")
        """Create new user with duplicate check"""
        try:
            # Check if user already exists
            existing = await self.get_by_number(user_in.number)
            if existing:
                log.error("User with this phone number already exists.")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User with this phone number already exists."
                )

            # Create new user (password is plain for now - as per your current requirement)
            db_user = User(
                user_name=user_in.user_name,
                number=user_in.number,
                hashed_password=user_in.password,        # Temporarily storing plain password
            )

            self.db.add(db_user)
            await self.db.commit()
            await self.db.refresh(db_user)
            log.info("User created successfully")
            return db_user

        except HTTPException:
            await self.db.rollback()
            raise
        except IntegrityError:
            await self.db.rollback()
            log.error("IntegrityError: User with this phone number already exists.")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this phone number already exists."
            )
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error(f" (SQLAlchemyError): {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        except Exception as e:
            await self.db.rollback()
            log.error(f" (Exception): {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error: {str(e)}"
            )

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        log.info(f"Getting user by ID: {user_id}")
        try:
            result = await self.db.execute(
                select(User).where(User.id == user_id)
            )
            log.info(f"User found of ID: {user_id}")
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error(f" (SQLAlchemyError): {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

    async def get_by_number(self, number: str) -> Optional[User]:
        """Get user by phone number"""
        log.info(f"Getting user by phone number: {number}")
        try:
            result = await self.db.execute(
                select(User).where(User.number == number)
            )
            log.info(f"User found of number: {number}")
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error(f" (SQLAlchemyError): {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

    async def exists_by_number(self, number: str) -> bool:
        """Check if user exists by number"""
        log.info(f"Checking if user exists by phone number: {number}")
        try:
            result = await self.db.execute(
                select(User.id).where(User.number == number).limit(1)
            )
            log.info(f"User exists of number: {number}")
            return result.scalar() is not None
        except SQLAlchemyError as e:
            log.error(f" (SQLAlchemyError): {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

    async def update(self, user_id: int, **kwargs) -> Optional[User]:
        """Update user"""
        log.info(f"Updating user of ID: {user_id}")
        try:
            user = await self.get_by_id(user_id)
            if not user:
                log.warning(f"User of ID: {user_id} not found")
                return None

            for key, value in kwargs.items():
                if hasattr(user, key) and key != "hashed_password":  # Prevent direct password update here
                    setattr(user, key, value)

            await self.db.commit()
            await self.db.refresh(user)
            log.info(f"User of ID: {user_id} updated successfully")
            return user
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error(f" (SQLAlchemyError): {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

    async def delete(self, user_id: int) -> bool:
        """Delete user"""
        log.info(f"Deleting user of ID: {user_id}")
        try:
            user = await self.get_by_id(user_id)
            if not user:
                log.warning(f"User of ID: {user_id} not found")
                return False

            await self.db.delete(user)
            await self.db.commit()
            log.info(f"User of ID: {user_id} deleted successfully")
            return True
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error(f" (SQLAlchemyError): {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
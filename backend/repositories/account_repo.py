from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import Optional, List

from backend.models.model import Account, User
from backend.schemas.account import AccountCreate, AccountUpdate
from backend.core.logging import log
from fastapi import HTTPException, status


class AccountRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, account_in: AccountCreate, user_id: int) -> Account:
        """Create a new Account/Khata"""
        log.info(
            "Creating new account: '{}' | Type: {} | User ID: {}",
            account_in.account_name,
            account_in.account_type,
            user_id,
        )

        try:
            # Check if account with same name already exists for this user
            existing = await self.get_by_name_and_user(
                name=account_in.account_name, user_id=user_id
            )
            if existing:
                log.warning("Account already exists: {}", account_in.account_name)
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Account with name '{account_in.account_name}' already exists.",
                )

            db_account = Account(
                account_name=account_in.account_name,
                account_type=account_in.account_type,
                user_id=user_id,
            )

            self.db.add(db_account)
            await self.db.commit()
            await self.db.refresh(db_account)

            log.success(
                "Account created successfully | ID: {} | Name: {}",
                db_account.id,
                db_account.account_name,
            )
            return db_account

        except HTTPException:
            await self.db.rollback()
            log.error("HTTP error while creating account: {}", account_in.account_name)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid account data.",
            )
        except IntegrityError:
            await self.db.rollback()
            log.error(
                "Integrity error while creating account: {}", account_in.account_name
            )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Account already exists or constraint violation.",
            )
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error creating account: {}", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error occurred while creating account.",
            )
        except Exception as e:
            await self.db.rollback()
            log.error("Unexpected error creating account: {}", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred.",
            )

    async def get_by_id(self, account_id: int) -> Optional[Account]:
        """Get account by ID"""
        log.debug("Fetching account by ID: {}", account_id)
        try:
            result = await self.db.execute(
                select(Account).where(Account.id == account_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error("Database error fetching account ID {}: {}", account_id, e)
            raise HTTPException(status_code=500, detail="Database error")

    async def get_by_name_and_user(self, name: str, user_id: int) -> Optional[Account]:
        """Check if an account with the same name already exists for the user"""
        log.debug("Checking existing account: '{}' for user_id: {}", name, user_id)

        try:
            # Optional: Verify user exists (good for better error messages)
            user_result = await self.db.execute(select(User).where(User.id == user_id))
            if not user_result.scalar_one_or_none():
                log.warning("User not found: ID {}", user_id)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
                )

            # Check for duplicate account name for this user
            result = await self.db.execute(
                select(Account).where(
                    Account.account_name == name, Account.user_id == user_id
                )
            )
            existing_account = result.scalar_one_or_none()

            if existing_account:
                log.warning(
                    "Duplicate account name found: '{}' for user {}", name, user_id
                )

            return existing_account

        except SQLAlchemyError as e:
            log.error("Database error while checking existing account: {}", str(e))
            # Don't raise here, just return None so create() can handle it
            return None
        except HTTPException:
            raise
        except Exception as e:
            log.error("Unexpected error checking account existence: {}", str(e))
            return None

    async def get_all_by_user(
        self, user_id: int, skip: int = 0, limit: int = 10
    ) -> List[Account]:
        """Get all accounts for a user"""
        log.debug("Fetching all accounts for user ID: {}", user_id)
        try:
            result = await self.db.execute(
                select(Account)
                .where(Account.user_id == user_id)
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            log.error("Database error fetching accounts for user {}: {}", user_id, e)
            raise HTTPException(status_code=500, detail="Database error")

    async def update(
        self, account_id: int, account_update: AccountUpdate
    ) -> Optional[Account]:

        log.info("Updating account ID: {}", account_id)

        try:
            account = await self.get_by_id(account_id)

            if not account:
                log.warning("Account not found: ID {}", account_id)
                return None

            update_data = account_update.model_dump(exclude_unset=True)

            for field, value in update_data.items():
                setattr(account, field, value)

            await self.db.commit()
            await self.db.refresh(account)

            log.success("Account updated successfully: ID {}", account_id)

            return account

        except SQLAlchemyError as e:
            await self.db.rollback()

            log.error("Database error updating account {}: {}", account_id, str(e))

        raise HTTPException(status_code=500, detail="Database error")

    async def delete(self, account_id: int) -> bool:
        """Delete account"""
        log.info("Attempting to delete account ID: {}", account_id)
        try:
            account = await self.get_by_id(account_id)
            if not account:
                return False

            await self.db.delete(account)
            await self.db.commit()

            log.success("Account deleted successfully: ID {}", account_id)
            return True

        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error deleting account {}: {}", account_id, e)
            raise HTTPException(status_code=500, detail="Database error")

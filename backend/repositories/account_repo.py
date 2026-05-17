from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, List

from backend.models.model import Account
from backend.core.logging import log
from backend.core.exceptions import DatabaseError
from sqlalchemy import func
from backend.models.model import Entry


class AccountRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, account_data: dict) -> Account:
        """Create a new Account/Khata"""
        try:
            db_account = Account(**account_data)
            self.db.add(db_account)
            await self.db.commit()
            await self.db.refresh(db_account)
            return db_account
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error creating account: {}", str(e))
            raise DatabaseError("Failed to create account in database.")

    async def get_by_id(self, account_id: int) -> Optional[Account]:
        """Get account by ID"""
        try:
            result = await self.db.execute(
                select(Account).where(Account.id == account_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error("Database error fetching account ID {}: {}", account_id, e)
            raise DatabaseError("Failed to fetch account from database.")

    async def get_by_name_and_user(self, name: str, user_id: int) -> Optional[Account]:
        """Get account by name and user_id"""
        try:
            result = await self.db.execute(
                select(Account).where(
                    func.lower(Account.account_name) == name.lower(), Account.user_id == user_id
                )
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error("Database error fetching account by name: {}", str(e))
            raise DatabaseError("Failed to fetch account by name from database.")

    async def get_all_by_user(
        self, user_id: int, skip: int = 0, limit: int = 10
    ) -> List[Account]:
        """Get all accounts for a user"""
        try:
            result = await self.db.execute(
                select(Account)
                .where(Account.user_id == user_id)
                .offset(skip)
                .limit(limit)
            )
            return list(result.scalars().all())
        except SQLAlchemyError as e:
            log.error("Database error fetching accounts for user {}: {}", user_id, e)
            raise DatabaseError("Failed to fetch user accounts from database.")

    async def update(self, account: Account, update_data: dict) -> Account:
        """Update an existing account"""
        try:
            for field, value in update_data.items():
                setattr(account, field, value)
            await self.db.commit()
            await self.db.refresh(account)
            return account
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error updating account {}: {}", account.id, str(e))
            raise DatabaseError("Failed to update account in database.")

    async def delete(self, account: Account) -> None:
        """Delete account"""
        try:
            await self.db.delete(account)
            await self.db.commit()
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error deleting account {}: {}", account.id, e)
            raise DatabaseError("Failed to delete account from database.")

    # get all accounts with amount(from entries) by user
    async def get_accounts_with_balance(
        self, user_id: int, skip: int = 0, limit: int = 10
    ) -> list[tuple[Account, float]]:
        try:
            stmt = (
                (
                    select(
                        Account,
                        func.coalesce(func.sum(Entry.amount), 0).label("balance"),
                    )
                )
                .outerjoin(Entry, Entry.account_id == Account.id)
                .where(Account.user_id == user_id)
                .group_by(Account.id)
                .offset(skip)
                .limit(limit)
            )
            result = await self.db.execute(stmt)
            return result.all()
        except SQLAlchemyError as e:
            log.error("Database error fetching accounts for user {}: {}", user_id, e)
            raise DatabaseError("Failed to fetch user accounts from database.")

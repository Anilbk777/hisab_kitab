from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from backend.repositories.account_repo import AccountRepository
from backend.repositories.user_repo import UserRepository
from backend.schemas.account import AccountCreate, AccountUpdate
from backend.models.model import Account
from backend.core.exceptions import NotFoundError, DuplicateError, ForbiddenError
from backend.core.logging import log


class AccountService:
    def __init__(self, db: AsyncSession):
        self.repository = AccountRepository(db)

    async def create_account(self, account_in: AccountCreate, user_id: int) -> Account:
        """Business logic for creating an account"""
        log.info("Service: Creating account '{}' for user {}", account_in.account_name, user_id)
        
        # Check if user exists
        user_repo = UserRepository(self.repository.db)
        user = await user_repo.get_by_id(user_id)
        if not user:
            log.warning("Service: User {} not found while creating account", user_id)
            raise NotFoundError("User", user_id)

        # Check if account with same name already exists for this user
        existing = await self.repository.get_by_name_and_user(
            name=account_in.account_name, user_id=user_id
        )
        if existing:
            log.warning("Service: Account '{}' already exists for user {}", account_in.account_name, user_id)
            raise DuplicateError("Account", account_in.account_name)

        account_data = account_in.model_dump()
        account_data["user_id"] = user_id
        
        return await self.repository.create(account_data)

    async def get_all_accounts(self, user_id: int, skip: int = 0, limit: int = 10) -> List[Account]:
        """Business logic for fetching all user accounts"""
        return await self.repository.get_all_by_user(user_id, skip, limit)

    async def get_account_by_id(self, account_id: int, user_id: int) -> Account:
        """Business logic for fetching a single account"""
        account = await self.repository.get_by_id(account_id)
        if not account:
            raise NotFoundError("Account", account_id)
        if account.user_id != user_id:
            raise ForbiddenError("You are not authorized to view this account.")
        return account

    async def update_account(self, account_id: int, user_id: int, account_update: AccountUpdate) -> Account:
        """Business logic for updating an account"""
        account = await self.get_account_by_id(account_id, user_id)
        update_data = account_update.model_dump(exclude_unset=True)
        return await self.repository.update(account, update_data)

    async def delete_account(self, account_id: int, user_id: int) -> None:
        """Business logic for deleting an account"""
        account = await self.get_account_by_id(account_id, user_id)
        await self.repository.delete(account)

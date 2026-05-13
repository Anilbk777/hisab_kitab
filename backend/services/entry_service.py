from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from backend.repositories.entry_repo import EntryRepository
from backend.repositories.account_repo import AccountRepository
from backend.schemas.entry_schema import EntryCreate, EntryUpdate
from backend.models.model import Entry
from backend.core.exceptions import NotFoundError, ForbiddenError
from backend.core.logging import log


class EntryService:
    def __init__(self, db: AsyncSession):
        self.entry_repo = EntryRepository(db)
        self.account_repo = AccountRepository(db)

    async def create_entry(self, entry_in: EntryCreate, user_id: int) -> Entry:
        """Business logic for creating a transaction entry"""
        log.info("Service: Creating entry for account_id: {}", entry_in.account_id)

        # Verify account exists
        account = await self.account_repo.get_by_id(entry_in.account_id)
        if not account:
            log.warning(
                "Service: Account ID {} not found for entry creation",
                entry_in.account_id,
            )
            raise NotFoundError("Account", entry_in.account_id)
        if account.user_id != user_id:
            raise ForbiddenError(
                "You are not authorized to create entries for this account."
            )

        entry_data = entry_in.model_dump()
        return await self.entry_repo.create(entry_data)

    async def get_entries_by_account(
        self, account_id: int, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Entry]:
        """Business logic for fetching entries for an account"""
        # Optional: Verify account exists first
        account = await self.account_repo.get_by_id(account_id)
        if not account:
            raise NotFoundError("Account", account_id)

        if account.user_id != user_id:
            raise ForbiddenError(
                "You are not authorized to create entries or access this account."
            )

        return await self.entry_repo.get_all_by_account(account_id, skip, limit)

    async def get_entry_by_id(self, entry_id: int, user_id: int) -> Entry:
        """Business logic for fetching a single entry"""
        entry = await self.entry_repo.get_by_id(entry_id)
        if not entry:
            raise NotFoundError("Entry", entry_id)
        if entry.account.user_id != user_id:
            raise ForbiddenError("You are not authorized to access this entry.")
        return entry

    async def update_entry(
        self, entry_id: int, entry_update: EntryUpdate, user_id: int
    ) -> Entry:
        """Business logic for updating an entry"""
        entry = await self.get_entry_by_id(entry_id, user_id)

        update_data = entry_update.model_dump(exclude_unset=True)
        return await self.entry_repo.update(entry, update_data)

    async def delete_entry(self, entry_id: int, user_id: int) -> None:
        """Business logic for deleting an entry"""
        entry = await self.get_entry_by_id(entry_id, user_id)
        await self.entry_repo.delete(entry)

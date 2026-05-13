from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, List

from backend.models.model import Entry
from backend.core.logging import log
from backend.core.exceptions import DatabaseError


class EntryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, entry_data: dict) -> Entry:
        """Create a new Entry"""
        try:
            db_entry = Entry(**entry_data)
            self.db.add(db_entry)
            await self.db.commit()
            await self.db.refresh(db_entry)
            return db_entry
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error creating entry: {}", str(e))
            raise DatabaseError("Failed to create entry in database.")

    async def get_by_id(self, entry_id: int) -> Optional[Entry]:
        """Get entry by ID"""
        try:
            result = await self.db.execute(
                select(Entry).where(Entry.id == entry_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error("Database error fetching entry ID {}: {}", entry_id, e)
            raise DatabaseError("Failed to fetch entry from database.")

    async def get_all_by_account(
        self, account_id: int, skip: int = 0, limit: int = 100
    ) -> List[Entry]:
        """Get all entries for an account"""
        try:
            result = await self.db.execute(
                select(Entry)
                .where(Entry.account_id == account_id)
                .order_by(Entry.entry_date.desc(), Entry.created_at.desc())
                .offset(skip)
                .limit(limit)
            )
            return list(result.scalars().all())
        except SQLAlchemyError as e:
            log.error("Database error fetching entries for account {}: {}", account_id, e)
            raise DatabaseError("Failed to fetch entries from database.")

    async def update(self, entry: Entry, update_data: dict) -> Entry:
        """Update an existing entry"""
        try:
            for field, value in update_data.items():
                setattr(entry, field, value)
            await self.db.commit()
            await self.db.refresh(entry)
            return entry
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error updating entry {}: {}", entry.id, str(e))
            raise DatabaseError("Failed to update entry in database.")

    async def delete(self, entry: Entry) -> None:
        """Delete entry"""
        try:
            await self.db.delete(entry)
            await self.db.commit()
        except SQLAlchemyError as e:
            await self.db.rollback()
            log.error("Database error deleting entry {}: {}", entry.id, e)
            raise DatabaseError("Failed to delete entry from database.")
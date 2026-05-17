from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.services.entry_service import EntryService
from backend.schemas.entry_schema import (
    EntryCreate,
    EntryUpdate,
    EntryResponse,
    AccountWithEntriesResponse,
)
from backend.core.logging import get_logger
from backend.middlewares.auth_middleware import CurrentUser

router = APIRouter(
    prefix="/api/entries",
    tags=["Entries"],
)


@router.post(
    "/",
    response_model=EntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Entry",
)
async def create_entry(
    entry_in: EntryCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    """Add a new transaction entry to an account"""
    logger.info("Router: Creating new entry for account_id: {}", entry_in.account_id)
    entry_service = EntryService(db)
    return await entry_service.create_entry(entry_in, current_user.id)


@router.get(
    "/account/{account_id}",
    response_model=AccountWithEntriesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Account with Paginated Entries and Balance",
)
async def get_account_with_entries(
    account_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
    skip: int = 0,
    limit: int = 50,
):
    """
    Get an account with its paginated entries and the computed total balance.
    """
    logger.info("Router: Fetching account {} with paginated entries.", account_id)
    entry_service = EntryService(db)
    return await entry_service.get_account_with_entries(
        account_id, current_user.id, skip, limit
    )


# @router.get(
#     "/account/{account_id}",
#     response_model=List[EntryResponse],
#     status_code=status.HTTP_200_OK,
#     summary="Get All Entries for Account",
# )
# async def get_entries_by_account(
#     account_id: int,
#     current_user: CurrentUser,
#     db: AsyncSession = Depends(get_db),
#     logger=Depends(get_logger),
#     skip: int = 0,
#     limit: int = 100,
# ):
#     """Get all entries for a specific account (latest first)"""
#     logger.debug("Router: Fetching entries for account_id: {}", account_id)
#     entry_service = EntryService(db)
#     return await entry_service.get_entries_by_account(
#         account_id, current_user.id, skip, limit
#     )


@router.get("/{entry_id}", response_model=EntryResponse, status_code=status.HTTP_200_OK)
async def get_entry(
    entry_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    """Get single entry by ID"""
    logger.info("Router: Fetching entry ID: {}", entry_id)
    entry_service = EntryService(db)
    return await entry_service.get_entry_by_id(entry_id, current_user.id)


@router.patch(
    "/{entry_id}",
    response_model=EntryResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Entry (Partial)",
)
async def update_entry(
    entry_id: int,
    entry_update: EntryUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    """Update an existing entry (PATCH - partial update)"""
    logger.info("Router: Updating entry ID: {}", entry_id)
    entry_service = EntryService(db)
    return await entry_service.update_entry(entry_id, current_user.id, entry_update)


@router.delete(
    "/{entry_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Entry"
)
async def delete_entry(
    entry_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    """Delete an entry"""
    logger.info("Router: Deleting entry ID: {}", entry_id)
    entry_service = EntryService(db)
    await entry_service.delete_entry(entry_id, current_user.id)
    return None

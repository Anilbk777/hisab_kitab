from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from backend.core.database import get_db
from backend.repositories.account_repo import AccountRepository
from backend.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from backend.core.logging import get_logger

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    account_in: AccountCreate,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    logger.info(
        "Creating account '{}' for user_id: {}", account_in.account_name, user_id
    )

    account_repo = AccountRepository(db)
    account = await account_repo.create(account_in, user_id=user_id)

    logger.success("Account created successfully | ID: {}", account.id)
    return account


@router.get("/", response_model=List[AccountResponse])
async def get_all_accounts(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
    skip: int = 0,
    limit: int = 50,
):
    logger.debug("Fetching all accounts for user_id: {}", user_id)

    account_repo = AccountRepository(db)
    accounts = await account_repo.get_all_by_user(
        user_id=user_id, skip=skip, limit=limit
    )

    logger.info("Retrieved {} accounts for user {}", len(accounts), user_id)
    return accounts


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: int, db: AsyncSession = Depends(get_db), logger=Depends(get_logger)
):
    account_repo = AccountRepository(db)
    account = await account_repo.get_by_id(account_id)

    if not account:
        logger.warning("Account not found: ID {}", account_id)
        raise HTTPException(status_code=404, detail="Account not found")

    return account


@router.patch("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int,
    account_update: AccountUpdate,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    logger.info("Updating account ID: {}", account_id)

    account_repo = AccountRepository(db)
    updated_account = await account_repo.update(account_id, account_update)

    if not updated_account:
        raise HTTPException(status_code=404, detail="Account not found")

    logger.success("Account updated successfully: ID {}", account_id)
    return updated_account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    account_id: int, db: AsyncSession = Depends(get_db), logger=Depends(get_logger)
):
    logger.info("Deleting account ID: {}", account_id)

    account_repo = AccountRepository(db)
    deleted = await account_repo.delete(account_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Account not found")

    logger.success("Account deleted successfully: ID {}", account_id)
    return None
